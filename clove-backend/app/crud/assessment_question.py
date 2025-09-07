# app/crud/assessment_question.py
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import func
import random
from typing import List, Dict, Any, Optional
from app.db.models.assessment_questions import AssessmentQuestion
from app.db.models.subtopics import Subtopic
from app.schemas.assessment_question import AssessmentQuestionCreate, AssessmentQuestionUpdate
from app.crud.pre_assessment import list_for_user_topic as get_pre_assessment_for_user_topic
from app.crud.post_assessment import list_for_user_topic as get_post_assessment_for_user_topic
from app.db.models.retention_tests import RetentionTest
from app.schemas.retention_test import RetentionTestSubmission, RetentionTestResult

async def get_by_id(db: AsyncSession, question_id: int) -> AssessmentQuestion | None:
    result = await db.execute(select(AssessmentQuestion).where(AssessmentQuestion.id == question_id))
    return result.scalars().first()

async def list_for_subtopic(db: AsyncSession, subtopic_id: int, skip: int = 0, limit: int = 100) -> list[AssessmentQuestion]:
    result = await db.execute(
        select(AssessmentQuestion).where(AssessmentQuestion.subtopic_id == subtopic_id).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def create(db: AsyncSession, ques_in: AssessmentQuestionCreate) -> AssessmentQuestion:
    new_q = AssessmentQuestion(
        subtopic_id=ques_in.subtopic_id,
        question_choices_correctanswer=ques_in.question_choices_correctanswer,
        difficulty=ques_in.difficulty
    )
    db.add(new_q)
    await db.commit()
    await db.refresh(new_q)
    
    return new_q

async def update(db: AsyncSession, ques_db: AssessmentQuestion, ques_in: AssessmentQuestionUpdate) -> AssessmentQuestion:
    ques_db.question_choices_correctanswer = ques_in.question_choices_correctanswer
    ques_db.difficulty = ques_in.difficulty
    db.add(ques_db)
    await db.commit()
    await db.refresh(ques_db)
    return ques_db

async def delete(db: AsyncSession, ques_db: AssessmentQuestion) -> None:
    await db.delete(ques_db)
    await db.commit()

async def get_questions_by_ids(db: AsyncSession, question_ids: list[int]) -> List[AssessmentQuestion]:
    """Get multiple assessment questions by their IDs, preserving order."""
    if not question_ids:
        return []
    result = await db.execute(select(AssessmentQuestion).where(AssessmentQuestion.id.in_(question_ids)))
    questions_map = {q.id: q for q in result.scalars().all()}
    # Return questions in the same order as the provided list of IDs
    return [questions_map[qid] for qid in question_ids if qid in questions_map]

# New functions for randomized questions logic
async def get_subtopics_for_topic(db: AsyncSession, topic_id: int) -> List[Subtopic]:
    """Get all subtopics for a given topic"""
    result = await db.execute(select(Subtopic).where(Subtopic.topic_id == topic_id))
    return result.scalars().all()

async def get_questions_for_subtopics(db: AsyncSession, subtopic_ids: List[int]) -> List[AssessmentQuestion]:
    """Get all questions for given subtopic IDs with subtopic relationship loaded"""
    result = await db.execute(
        select(AssessmentQuestion)
        .where(AssessmentQuestion.subtopic_id.in_(subtopic_ids))
        .options(selectinload(AssessmentQuestion.subtopic))
    )
    return result.scalars().all()

async def get_randomized_questions_for_topic(
    db: AsyncSession, 
    topic_id: int, 
    user_id: int,
    assessment_type: str,
    questions_per_subtopic: int = 5
) -> List[AssessmentQuestion]:
    """
    Get randomized assessment questions from a topic.
    - For post-assessments, it reuses the full set of questions from a completed pre-assessment.
    - For pre-assessments, it automatically provides the remaining number of questions for an incomplete attempt,
      while maintaining the subtopic balance.
    """
    
    # Get pre-assessment data once (needed for both pre and post assessment logic)
    pre_assessments = await get_pre_assessment_for_user_topic(db, user_id, topic_id)
    pre_assessment = pre_assessments[0] if pre_assessments else None
    
    # For post-assessments, always reuse the same questions from completed pre-assessment
    if assessment_type == 'post':
        if not pre_assessment or not pre_assessment.questions_answers_iscorrect:
            raise ValueError("Post-assessment requires a completed pre-assessment")
        
        # Get the exact same questions that were used in pre-assessment
        question_ids_to_reuse = [int(qid) for qid in pre_assessment.questions_answers_iscorrect.keys()]
        reused_questions = await get_questions_by_ids(db, question_ids_to_reuse)
        
        # Check if user has partial progress in post-assessment
        post_assessments = await get_post_assessment_for_user_topic(db, user_id, topic_id)
        if post_assessments and post_assessments[0].questions_answers_iscorrect:
            # User has partial progress - return only unanswered questions
            answered_in_post = set(int(qid) for qid in post_assessments[0].questions_answers_iscorrect.keys())
            remaining_questions = [q for q in reused_questions if q.id not in answered_in_post]
            random.shuffle(remaining_questions)
            return remaining_questions
        
        # No progress yet - return all questions shuffled
        random.shuffle(reused_questions)
        return reused_questions

    # For pre-assessments, handle resume logic
    if assessment_type == 'pre':
        if pre_assessment and pre_assessment.questions_answers_iscorrect:
            # User has partial progress - return only unanswered questions
            answered_question_ids = set(int(qid) for qid in pre_assessment.questions_answers_iscorrect.keys())
            answered_count_by_subtopic = {}
            
            # Count answered questions per subtopic
            answered_questions = await get_questions_by_ids(db, list(answered_question_ids))
            for q in answered_questions:
                answered_count_by_subtopic[q.subtopic_id] = answered_count_by_subtopic.get(q.subtopic_id, 0) + 1
            
            # Get all subtopics and questions for this topic
            subtopics = await get_subtopics_for_topic(db, topic_id)
            if not subtopics:
                raise ValueError(f"No subtopics found for topic_id {topic_id}")
            
            all_questions = await get_questions_for_subtopics(db, subtopic_ids=[s.subtopic_id for s in subtopics])
            
            # Filter out answered questions and group by subtopic
            unanswered_questions = [q for q in all_questions if q.id not in answered_question_ids]
            questions_by_subtopic = {}
            for question in unanswered_questions:
                subtopic_id = question.subtopic_id
                if subtopic_id not in questions_by_subtopic:
                    questions_by_subtopic[subtopic_id] = []
                questions_by_subtopic[subtopic_id].append(question)
            
            # Select remaining questions needed for each subtopic
            selected_questions = []
            
            for subtopic in subtopics:
                sid = subtopic.subtopic_id
                answered_count = answered_count_by_subtopic.get(sid, 0)
                needed_count = questions_per_subtopic - answered_count

                if needed_count > 0:
                    available_for_subtopic = questions_by_subtopic.get(sid, [])
                    if len(available_for_subtopic) < needed_count:
                        raise ValueError(
                            f"Not enough new questions available for subtopic {sid} to create a balanced assessment. "
                            f"Need {needed_count}, but only {len(available_for_subtopic)} found."
                        )
                    
                    selected_for_subtopic = random.sample(available_for_subtopic, needed_count)
                    selected_questions.extend(selected_for_subtopic)
            
            # Shuffle final selection for randomness
            random.shuffle(selected_questions)
            
            return selected_questions
        
        else:
            # No pre-assessment exists yet - create new one with balanced questions
            subtopics = await get_subtopics_for_topic(db, topic_id)
            if not subtopics:
                raise ValueError(f"No subtopics found for topic_id {topic_id}")
            
            all_questions = await get_questions_for_subtopics(db, subtopic_ids=[s.subtopic_id for s in subtopics])
            
            # Group questions by subtopic and select balanced set
            questions_by_subtopic = {}
            for question in all_questions:
                subtopic_id = question.subtopic_id
                if subtopic_id not in questions_by_subtopic:
                    questions_by_subtopic[subtopic_id] = []
                questions_by_subtopic[subtopic_id].append(question)
            
            selected_questions = []
            for subtopic in subtopics:
                sid = subtopic.subtopic_id
                available_for_subtopic = questions_by_subtopic.get(sid, [])
                
                if len(available_for_subtopic) < questions_per_subtopic:
                    raise ValueError(
                        f"Not enough questions available for subtopic {sid}. "
                        f"Need {questions_per_subtopic}, but only {len(available_for_subtopic)} found."
                    )
                
                selected_for_subtopic = random.sample(available_for_subtopic, questions_per_subtopic)
                selected_questions.extend(selected_for_subtopic)
            
            random.shuffle(selected_questions)
            return selected_questions

async def get_randomized_questions_summary(
    db: AsyncSession, 
    topic_id: int, 
    user_id: int,
    assessment_type: str,
    questions_per_subtopic: int = 5
) -> Dict[str, Any]:
    """
    Get a summary of randomized questions for a topic.
    Returns question IDs and metadata for frontend to track progress.
    """
    
    # Get the randomized questions, excluding any from previous attempts
    questions = await get_randomized_questions_for_topic(
        db, topic_id, user_id, assessment_type, questions_per_subtopic
    )
    
    # Create summary with question IDs and metadata
    summary = {
        "topic_id": topic_id,
        "total_questions": len(questions),
        "questions_per_subtopic": questions_per_subtopic,
        "questions": [
            {
                "id": q.id,
                "difficulty": q.difficulty,
                "subtopic_id": q.subtopic_id,
                "subtopic_name": q.subtopic.title if q.subtopic else None,
                "question_number": i + 1
            }
            for i, q in enumerate(questions)
        ]
    }
    
    return summary

# Retention Test Functions
async def get_retention_test_questions(
    db: AsyncSession, 
    topic_id: int, 
    user_id: int,
    questions_per_subtopic: int = 5
) -> List[AssessmentQuestion]:
    """
    Get retention test questions for a specific topic.
    Returns remaining questions (5 per subtopic) with varying difficulty.
    Mixes familiar questions (from pre/post assessments) with new questions.
    """
    
    # Verify user has completed pre and post assessments for this topic
    pre_assessments = await get_pre_assessment_for_user_topic(db, user_id, topic_id)
    post_assessments = await get_post_assessment_for_user_topic(db, user_id, topic_id)
    
    if not pre_assessments or not post_assessments:
        raise ValueError("User must complete pre and post assessments before taking retention test")
    
    pre_assessment = pre_assessments[0]
    post_assessment = post_assessments[0]
    
    if not pre_assessment.is_completed or not post_assessment.is_completed:
        raise ValueError("User must complete both pre and post assessments before taking retention test")
    
    # Check if user has existing retention test progress
    result = await db.execute(
        select(RetentionTest).where(
            RetentionTest.user_id == user_id,
            RetentionTest.topic_id == topic_id
        )
    )
    existing_retention_test = result.scalar_one_or_none()
    
    # If user has partial progress, return only remaining questions
    if existing_retention_test and existing_retention_test.questions_answers:
        answered_question_ids = set(int(qid) for qid in existing_retention_test.questions_answers.keys())
        questions_already_answered = len(answered_question_ids)
        questions_still_needed = 15 - questions_already_answered
        
        # Get all subtopics for this topic
        subtopics = await get_subtopics_for_topic(db, topic_id)
        if not subtopics:
            raise ValueError(f"No subtopics found for topic_id {topic_id}")
        
        # Get all questions for this topic
        all_questions = await get_questions_for_subtopics(db, subtopic_ids=[s.subtopic_id for s in subtopics])
        
        # Filter out already answered questions
        available_questions = [q for q in all_questions if q.id not in answered_question_ids]
        
        # Group available questions by subtopic
        questions_by_subtopic = {}
        for question in available_questions:
            subtopic_id = question.subtopic_id
            if subtopic_id not in questions_by_subtopic:
                questions_by_subtopic[subtopic_id] = []
            questions_by_subtopic[subtopic_id].append(question)
        
        # Get questions user has already answered in pre/post assessments (familiar questions)
        familiar_question_ids = set()
        if pre_assessment.questions_answers_iscorrect:
            familiar_question_ids.update(int(qid) for qid in pre_assessment.questions_answers_iscorrect.keys())
        if post_assessment.questions_answers_iscorrect:
            familiar_question_ids.update(int(qid) for qid in post_assessment.questions_answers_iscorrect.keys())
        
        # Separate available questions into familiar and new by subtopic
        familiar_by_subtopic = {}
        new_by_subtopic = {}
        
        for subtopic in subtopics:
            sid = subtopic.subtopic_id
            familiar_by_subtopic[sid] = []
            new_by_subtopic[sid] = []
            
            for question in questions_by_subtopic.get(sid, []):
                if question.id in familiar_question_ids:
                    familiar_by_subtopic[sid].append(question)
                else:
                    new_by_subtopic[sid].append(question)
        
        # Select remaining questions using the same logic as fresh selection
        selected_questions = []
        
        # Calculate how many questions needed per subtopic to reach 5 total
        questions_needed_per_subtopic = {}
        for subtopic in subtopics:
            sid = subtopic.subtopic_id
            
            # Count how many questions user already answered for this subtopic
            answered_in_subtopic = 0
            for question_id in answered_question_ids:
                # Find which subtopic this answered question belongs to
                for q in all_questions:
                    if q.id == int(question_id) and q.subtopic_id == sid:
                        answered_in_subtopic += 1
                        break
            
            # Calculate how many more needed to reach 5
            questions_needed_per_subtopic[sid] = 5 - answered_in_subtopic
        
        # Fill each subtopic to reach 5 questions total
        for subtopic in subtopics:
            sid = subtopic.subtopic_id
            questions_needed = questions_needed_per_subtopic[sid]
            
            if questions_needed <= 0:
                continue  # This subtopic already has 5 questions
            
            # Get available questions for this subtopic (excluding already answered)
            available_familiar = [q for q in familiar_by_subtopic.get(sid, []) if q.id not in answered_question_ids]
            available_new = [q for q in new_by_subtopic.get(sid, []) if q.id not in answered_question_ids]
            
            # Shuffle for randomness
            random.shuffle(available_familiar)
            random.shuffle(available_new)
            
            # Select questions maintaining familiar/new mix (same ratio as original)
            # Original ratio: roughly 60% familiar, 40% new
            familiar_needed = min(int(questions_needed * 0.6), len(available_familiar))
            new_needed = questions_needed - familiar_needed
            
            # If we don't have enough familiar questions, fill with new ones
            if familiar_needed < int(questions_needed * 0.6):
                new_needed = questions_needed - familiar_needed
            
            # Select familiar questions
            if familiar_needed > 0:
                selected_familiar = available_familiar[:familiar_needed]
                selected_questions.extend(selected_familiar)
            
            # Select new questions
            if new_needed > 0:
                selected_new = available_new[:new_needed]
                selected_questions.extend(selected_new)
            
            # If we still don't have enough, fill with remaining available questions
            remaining_needed = questions_needed - len([q for q in selected_questions if q.subtopic_id == sid])
            if remaining_needed > 0:
                # Get all remaining available questions for this subtopic
                all_available_for_subtopic = [q for q in available_questions if q.subtopic_id == sid and q not in selected_questions]
                if all_available_for_subtopic:
                    additional = random.sample(all_available_for_subtopic, min(remaining_needed, len(all_available_for_subtopic)))
                    selected_questions.extend(additional)
        
        # Shuffle final selection for randomness
        random.shuffle(selected_questions)
        
        return selected_questions
    
    # No existing progress - return all 15 questions as before
    # Get all subtopics for this topic
    subtopics = await get_subtopics_for_topic(db, topic_id)
    if not subtopics:
        raise ValueError(f"No subtopics found for topic_id {topic_id}")
    
    # Get all questions for this topic
    all_questions = await get_questions_for_subtopics(db, subtopic_ids=[s.subtopic_id for s in subtopics])
    
    # Group questions by subtopic
    questions_by_subtopic = {}
    for question in all_questions:
        subtopic_id = question.subtopic_id
        if subtopic_id not in questions_by_subtopic:
            questions_by_subtopic[subtopic_id] = []
        questions_by_subtopic[subtopic_id].append(question)
    
    # Get questions user has already answered (familiar questions)
    familiar_question_ids = set()
    if pre_assessment.questions_answers_iscorrect:
        familiar_question_ids.update(int(qid) for qid in pre_assessment.questions_answers_iscorrect.keys())
    if post_assessment.questions_answers_iscorrect:
        familiar_question_ids.update(int(qid) for qid in post_assessment.questions_answers_iscorrect.keys())
    
    # Separate familiar and new questions by subtopic
    familiar_by_subtopic = {}
    new_by_subtopic = {}
    
    for subtopic in subtopics:
        sid = subtopic.subtopic_id
        familiar_by_subtopic[sid] = []
        new_by_subtopic[sid] = []
        
        for question in questions_by_subtopic.get(sid, []):
            if question.id in familiar_question_ids:
                familiar_by_subtopic[sid].append(question)
            else:
                new_by_subtopic[sid].append(question)
    
    # Select questions for each subtopic (5 per subtopic)
    selected_questions = []
    
    for subtopic in subtopics:
        sid = subtopic.subtopic_id
        
        # Get familiar questions (3 per subtopic = 60%)
        familiar_count = min(3, len(familiar_by_subtopic[sid]))
        familiar_selected = random.sample(familiar_by_subtopic[sid], familiar_count) if familiar_by_subtopic[sid] else []
        
        # Get new questions (2 per subtopic = 40%)
        new_count = 5 - familiar_count  # Always 5 total per subtopic
        new_selected = random.sample(new_by_subtopic[sid], new_count) if new_by_subtopic[sid] else []
        
        # Combine and add to selected questions
        subtopic_questions = familiar_selected + new_selected
        
        # Ensure we have exactly 5 questions per subtopic
        if len(subtopic_questions) < 5:
            # If we don't have enough questions, fill with familiar questions
            remaining_needed = 5 - len(subtopic_questions)
            remaining_familiar = [q for q in familiar_by_subtopic[sid] if q not in familiar_selected]
            if remaining_familiar:
                additional_familiar = random.sample(remaining_familiar, min(remaining_needed, len(remaining_familiar)))
                subtopic_questions.extend(additional_familiar)
        
        # Ensure we don't exceed 5 questions per subtopic
        if len(subtopic_questions) > 5:
            subtopic_questions = random.sample(subtopic_questions, 5)
        
        selected_questions.extend(subtopic_questions)
    
    # Shuffle all questions for randomness
    random.shuffle(selected_questions)
    
    return selected_questions

async def submit_retention_test_answer(
    db: AsyncSession,
    user_id: int,
    topic_id: int,
    question_id: int,
    user_answer: Any
) -> RetentionTestResult:
    """
    Submit a single answer for retention test and update progress.
    """
    
    # Get the question
    question = await get_by_id(db, question_id)
    if not question:
        raise ValueError("Question not found")
    
    # Check if answer is correct
    correct_answer = question.question_choices_correctanswer.get('correct_answer')
    is_correct = user_answer == correct_answer
    
    # Get or create retention test record
    result = await db.execute(
        select(RetentionTest).where(
            RetentionTest.user_id == user_id,
            RetentionTest.topic_id == topic_id
        )
    )
    retention_test = result.scalar_one_or_none()
    
    if not retention_test:
        # Create new retention test record
        retention_test = RetentionTest(
            user_id=user_id,
            topic_id=topic_id,
            questions_answers={},
            total_score=0.0,
            total_items=0,
            is_completed=False
        )
        db.add(retention_test)
        await db.flush()
    
    # Update the specific answer
    questions_answers = retention_test.questions_answers.copy()
    questions_answers[str(question_id)] = {
        'user_answer': user_answer,
        'correct_answer': correct_answer,
        'is_correct': is_correct
    }
    
    # Calculate new scores
    total_correct = sum(1 for answer in questions_answers.values() if answer.get('is_correct', False))
    total_items = len(questions_answers)
    
    # Check if retention test is completed (15 questions)
    is_completed = total_items >= 15
    
    # Calculate final score
    final_score = (total_correct / 15) * 100 if total_items >= 15 else (total_correct / total_items) * 100
    
    # Update retention test record
    retention_test.questions_answers = questions_answers
    retention_test.total_score = round(final_score, 2)
    retention_test.total_items = total_items
    retention_test.is_completed = is_completed
    
    if is_completed:
        retention_test.completed_at = func.now()
    
    await db.commit()
    await db.refresh(retention_test)
    
    return RetentionTestResult(
        message="Answer submitted successfully",
        is_correct=is_correct,
        correct_answer=correct_answer,
        progress={
            "total_answered": total_items,
            "total_correct": total_correct,
            "score_percentage": final_score,
            "is_completed": is_completed,
            "questions_remaining": max(0, 15 - total_items)
        }
    )

async def get_retention_test_status(
    db: AsyncSession,
    user_id: int,
    topic_id: int
) -> Dict[str, Any]:
    """
    Get retention test status for a user and topic.
    Returns completion status, progress, and score.
    """
    # Get retention test record
    result = await db.execute(
        select(RetentionTest).where(
            RetentionTest.user_id == user_id,
            RetentionTest.topic_id == topic_id
        )
    )
    retention_test = result.scalar_one_or_none()
    
    if not retention_test:
        return {
            "is_completed": False,
            "total_answered": 0,
            "total_correct": 0,
            "score_percentage": 0.0,
            "questions_remaining": 15,
            "completed_at": None
        }
    
    # Calculate progress
    total_answered = retention_test.total_items or 0
    total_correct = sum(1 for answer in retention_test.questions_answers.values() if answer.get('is_correct', False))
    score_percentage = retention_test.total_score or 0.0
    is_completed = retention_test.is_completed or False
    questions_remaining = max(0, 15 - total_answered)
    
    return {
        "is_completed": is_completed,
        "total_answered": total_answered,
        "total_correct": total_correct,
        "score_percentage": score_percentage,
        "questions_remaining": questions_remaining,
        "completed_at": retention_test.completed_at
    }

async def get_retention_test_results(
    db: AsyncSession,
    user_id: int,
    topic_id: int
) -> Dict[str, Any]:
    """
    Get comprehensive retention test results for a user and topic.
    Returns questions, user answers, and detailed results.
    """
    # Get retention test record
    result = await db.execute(
        select(RetentionTest).where(
            RetentionTest.user_id == user_id,
            RetentionTest.topic_id == topic_id
        )
    )
    retention_test = result.scalar_one_or_none()
    
    if not retention_test:
        raise ValueError("Retention test not found for this user and topic")
    
    if not retention_test.is_completed:
        raise ValueError("Retention test not completed yet")
    
    # Get all questions for this topic to build comprehensive results
    subtopics = await get_subtopics_for_topic(db, topic_id)
    all_questions = await get_questions_for_subtopics(db, subtopic_ids=[s.subtopic_id for s in subtopics])
    
    # Build results structure
    results = {
        "assessment": {
            "total_score": retention_test.total_score or 0.0,
            "total_items": retention_test.total_items or 15,
            "is_completed": retention_test.is_completed,
            "completed_at": retention_test.completed_at
        },
        "questionsBySubtopic": {},
        "scorePercentage": retention_test.total_score or 0.0,
        "totalQuestions": 15,
        "totalCorrect": sum(1 for answer in retention_test.questions_answers.values() if answer.get('is_correct', False)),
        "totalAnswered": len(retention_test.questions_answers)
    }
    
    # Group questions by subtopic with user answers
    for subtopic in subtopics:
        subtopic_id = subtopic.subtopic_id
        subtopic_name = subtopic.title
        
        # Get questions for this subtopic that were actually in the retention test
        # Only include questions that have user answers
        subtopic_questions = []
        for q in all_questions:
            if q.subtopic_id == subtopic_id:
                # Check if this question was actually in the retention test
                if str(q.id) in retention_test.questions_answers:
                    subtopic_questions.append(q)
        
        # Build subtopic results
        subtopic_results = {
            "id": subtopic_id,
            "name": subtopic_name,
            "questions": [],
            "correctCount": 0,
            "totalCount": len(subtopic_questions)
        }
        
        for question in subtopic_questions:
            # Get user's answer for this question
            user_answer_data = retention_test.questions_answers.get(str(question.id), {})
            user_answer = user_answer_data.get('user_answer')
            is_correct = user_answer_data.get('is_correct', False)
            correct_answer = user_answer_data.get('correct_answer')
            
            if is_correct:
                subtopic_results["correctCount"] += 1
            
            # Build question result
            question_result = {
                "id": question.id,
                "question_text": question.question_choices_correctanswer.get('question', 'Question text not available'),
                "question_choices": question.question_choices_correctanswer.get('choices', []),
                "correct_answer": correct_answer,
                "user_answer": user_answer,
                "is_correct": is_correct,
                "difficulty": question.difficulty,  # Include difficulty for frontend coloring
                "explanation": question.question_choices_correctanswer.get('explanation', 'No explanation available')  # Include explanation
            }
            
            subtopic_results["questions"].append(question_result)
        
        results["questionsBySubtopic"][subtopic_id] = subtopic_results
    
    return results
