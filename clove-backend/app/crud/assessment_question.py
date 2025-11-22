# app/crud/assessment_question.py
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import func
import random
from typing import List, Dict, Any, Optional
from app.db.models.assessment_questions import AssessmentQuestion
from app.db.models.subtopics import Subtopic
from app.db.models.user_topics import UserTopic
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
        select(AssessmentQuestion)
        .where(AssessmentQuestion.subtopic_id == subtopic_id)
        .where(AssessmentQuestion.id < 136)  # Exclude retention test questions (IDs 136+)
        .offset(skip).limit(limit)
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
        .where(AssessmentQuestion.id < 136)  # Exclude retention test questions (IDs 136+)
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
    stage: int = 1
) -> List[AssessmentQuestion]:
    """
    Get retention test questions for a specific topic and stage.
    Stage 1 (10 hours): Questions with IDs 136-150 (15 questions)
    Stage 2 (5 days): Questions with IDs 151-165 (15 questions)
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
    
    # Check if user has existing retention test progress for this stage
    result = await db.execute(
        select(RetentionTest).where(
            RetentionTest.user_id == user_id,
            RetentionTest.topic_id == topic_id,
            RetentionTest.stage == stage
        )
    )
    existing_retention_test = result.scalar_one_or_none()
    
    # Define question ID ranges for each topic and stage
    # Topic 1: 136-150 (stage 1), 181-195 (stage 2)
    # Topic 2: 151-165 (stage 1), 196-210 (stage 2)  
    # Topic 3: 166-180 (stage 1), 211-225 (stage 2)
    if stage == 1:
        if topic_id == 1:
            question_id_range = range(136, 151)  # IDs 136-150
        elif topic_id == 2:
            question_id_range = range(151, 166)  # IDs 151-165
        elif topic_id == 3:
            question_id_range = range(166, 181)  # IDs 166-180
        else:
            raise ValueError(f"Retention test not available for topic {topic_id}")
    elif stage == 2:
        if topic_id == 1:
            question_id_range = range(181, 196)  # IDs 181-195
        elif topic_id == 2:
            question_id_range = range(196, 211)  # IDs 196-210
        elif topic_id == 3:
            question_id_range = range(211, 226)  # IDs 211-225
        else:
            raise ValueError(f"Retention test not available for topic {topic_id}")
    else:
        raise ValueError("Invalid retention test stage. Must be 1 or 2.")
    
    # Get questions by specific ID range
    result = await db.execute(
        select(AssessmentQuestion).where(
            AssessmentQuestion.id.in_(question_id_range)
        )
    )
    all_stage_questions = result.scalars().all()
    
    if len(all_stage_questions) != 15:
        raise ValueError(f"Expected 15 questions for stage {stage}, but found {len(all_stage_questions)}")
    
    # If user has partial progress, return only remaining questions
    if existing_retention_test and existing_retention_test.questions_answers:
        answered_question_ids = set(int(qid) for qid in existing_retention_test.questions_answers.keys())
        remaining_questions = [q for q in all_stage_questions if q.id not in answered_question_ids]
        random.shuffle(remaining_questions)
        return remaining_questions
    
    # No existing progress - return all questions for this stage
    random.shuffle(all_stage_questions)
    return all_stage_questions

async def check_retention_test_availability(
    db: AsyncSession,
    user_id: int,
    topic_id: int
) -> Dict[str, Any]:
    """
    Check which retention test stages are available based on assessment completion timing.
    Both stages share the same timer (count from when both assessments are completed).
    First stage: Available after 10 hours
    Second stage: Available after 1.5 days (36 hours)
    Returns information about available stages and countdown timers.
    """
    from datetime import datetime, timezone, timedelta
    
    # OLD LOGIC - Commented out: Required topic to be fully completed (all subtopics)
    # # Get user topic completion info
    # result = await db.execute(
    #     select(UserTopic).where(
    #         UserTopic.user_id == user_id,
    #         UserTopic.topic_id == topic_id,
    #         UserTopic.is_completed == True
    #     )
    # )
    # user_topic = result.scalar_one_or_none()
    # 
    # if not user_topic or not user_topic.completed_at:
    #     return {
    #         "first_stage_available": False,
    #         "second_stage_available": False,
    #         "first_stage_countdown": None,
    #         "second_stage_countdown": None,
    #         "message": "Topic not completed yet"
    #     }
    # 
    # current_time = datetime.now(timezone.utc)
    # completed_at = user_topic.completed_at
    
    # NEW LOGIC: Check if both pre and post assessments are completed
    # (subtopics completion is not required)
    
    # Get user topic (without requiring is_completed)
    result = await db.execute(
        select(UserTopic).where(
            UserTopic.user_id == user_id,
            UserTopic.topic_id == topic_id
        )
    )
    user_topic = result.scalar_one_or_none()
    
    if not user_topic:
        return {
            "first_stage_available": False,
            "second_stage_available": False,
            "first_stage_countdown": None,
            "second_stage_countdown": None,
            "message": "User topic not found"
        }
    
    # Get pre and post assessments
    pre_assessments = await get_pre_assessment_for_user_topic(db, user_id, topic_id)
    post_assessments = await get_post_assessment_for_user_topic(db, user_id, topic_id)
    
    # Check if both assessments exist and are completed
    pre_assessment = pre_assessments[0] if pre_assessments else None
    post_assessment = post_assessments[0] if post_assessments else None
    
    # Both assessments must exist
    if not pre_assessment or not post_assessment:
        return {
            "first_stage_available": False,
            "second_stage_available": False,
            "first_stage_countdown": None,
            "second_stage_countdown": None,
            "message": "Both pre and post assessments must exist"
        }
    
    # Both assessments must be completed
    is_pre_completed = pre_assessment.is_completed
    is_post_completed = post_assessment.is_completed
    
    if not is_pre_completed or not is_post_completed:
        return {
            "first_stage_available": False,
            "second_stage_available": False,
            "first_stage_countdown": None,
            "second_stage_countdown": None,
            "message": "Both pre and post assessments must be completed"
        }
    
    # Both assessments must have completion timestamps
    # Retention test timing starts from when BOTH assessments are completed
    current_time = datetime.now(timezone.utc)
    pre_taken_at = pre_assessment.taken_at
    post_taken_at = post_assessment.taken_at
    
    if not pre_taken_at or not post_taken_at:
        return {
            "first_stage_available": False,
            "second_stage_available": False,
            "first_stage_countdown": None,
            "second_stage_countdown": None,
            "message": "Both assessments must have completion timestamps"
        }
    
    # Use the later of the two assessment completion times
    # This ensures timing starts from when BOTH assessments are fully completed
    completed_at = max(pre_taken_at, post_taken_at)
    
    # Calculate time differences
    # Both stages share the same timer - count from when both assessments are completed
    time_since_completion = current_time - completed_at
    hours_since_completion = time_since_completion.total_seconds() / 3600
    days_since_completion = hours_since_completion / 24
    
    # Check first stage availability (10 hours)
    # Timer starts from when both assessments are completed (completed_at)
    first_stage_available = hours_since_completion >= 10  # 10 hours
    first_stage_countdown = None
    if not first_stage_available:
        hours_remaining = 10 - hours_since_completion
        first_stage_countdown = {
            "hours": int(hours_remaining),
            "minutes": int((hours_remaining % 1) * 60)
        }
    
    # Check second stage availability (1.5 days = 36 hours)
    second_stage_available = hours_since_completion >= 36  # 1.5 days = 36 hours
    second_stage_countdown = None
    if not second_stage_available:
        hours_remaining = 36 - hours_since_completion
        days_remaining = int(hours_remaining / 24)
        hours_in_day = hours_remaining % 24
        second_stage_countdown = {
            "days": days_remaining,
            "hours": int(hours_in_day),
            "minutes": int((hours_in_day % 1) * 60)
        }
    
    # Check if stages are completed
    # ALWAYS check completion status, regardless of availability
    # This ensures we detect completed tests even if timing has changed
    first_stage_completed = False
    second_stage_completed = False
    
    # Always check for completed first stage (regardless of availability)
    result = await db.execute(
        select(RetentionTest).where(
            RetentionTest.user_id == user_id,
            RetentionTest.topic_id == topic_id,
            RetentionTest.stage == 1,
            RetentionTest.is_completed == True
        )
    )
    first_stage_completed = result.scalar_one_or_none() is not None
    
    # Always check for completed second stage (regardless of availability)
    result = await db.execute(
        select(RetentionTest).where(
            RetentionTest.user_id == user_id,
            RetentionTest.topic_id == topic_id,
            RetentionTest.stage == 2,
            RetentionTest.is_completed == True
        )
    )
    second_stage_completed = result.scalar_one_or_none() is not None
    
    return {
        "first_stage_available": first_stage_available and not first_stage_completed,
        "second_stage_available": second_stage_available and not second_stage_completed,
        "first_stage_completed": first_stage_completed,
        "second_stage_completed": second_stage_completed,
        "first_stage_countdown": first_stage_countdown,
        "second_stage_countdown": second_stage_countdown,
        "completed_at": completed_at.isoformat(),
        "hours_since_completion": round(hours_since_completion, 2)
    }

async def submit_retention_test_answer(
    db: AsyncSession,
    user_id: int,
    topic_id: int,
    question_id: int,
    user_answer: Any,
    stage: int = 1
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
    
    # Get or create retention test record for this stage
    result = await db.execute(
        select(RetentionTest).where(
            RetentionTest.user_id == user_id,
            RetentionTest.topic_id == topic_id,
            RetentionTest.stage == stage
        )
    )
    retention_test = result.scalar_one_or_none()
    
    if not retention_test:
        # Create new retention test record for this stage
        retention_test = RetentionTest(
            user_id=user_id,
            topic_id=topic_id,
            stage=stage,
            questions_answers={},
            total_score=0.0,
            total_items=0,
            is_completed=False,
            first_stage_completed=stage == 1,
            second_stage_completed=stage == 2
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
    
    # Update stage completion flags
    if is_completed:
        retention_test.completed_at = func.now()
        if stage == 1:
            retention_test.first_stage_completed = True
        elif stage == 2:
            retention_test.second_stage_completed = True
    
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
    topic_id: int,
    stage: int = 1
) -> Dict[str, Any]:
    """
    Get retention test status for a user, topic, and stage.
    Returns completion status, progress, and score.
    """
    # Get retention test record for this stage
    result = await db.execute(
        select(RetentionTest).where(
            RetentionTest.user_id == user_id,
            RetentionTest.topic_id == topic_id,
            RetentionTest.stage == stage
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
    topic_id: int,
    stage: int = None
) -> Dict[str, Any]:
    """
    Get comprehensive retention test results for a user and topic.
    Returns questions, user answers, and detailed results.
    """
    # Get retention test record for specific stage or latest completed stage
    if stage:
        result = await db.execute(
            select(RetentionTest).where(
                RetentionTest.user_id == user_id,
                RetentionTest.topic_id == topic_id,
                RetentionTest.stage == stage,
                RetentionTest.is_completed == True
            )
        )
        retention_test = result.scalar_one_or_none()
        
        if not retention_test:
            raise ValueError(f"Retention test stage {stage} not found or not completed for this user and topic")
    else:
        # Get the latest completed retention test
        result = await db.execute(
            select(RetentionTest).where(
                RetentionTest.user_id == user_id,
                RetentionTest.topic_id == topic_id,
                RetentionTest.is_completed == True
            ).order_by(RetentionTest.stage.desc())
        )
        retention_test = result.scalar_one_or_none()
        
        if not retention_test:
            raise ValueError("No completed retention test found for this user and topic")
    
    # Get the specific questions that were used in this retention test
    # For retention tests, we use specific question ID ranges based on topic and stage
    # Use the actual stage from the retention test record to ensure consistency
    actual_stage = retention_test.stage
    actual_topic_id = retention_test.topic_id
    
    # Topic 1: 136-150 (stage 1), 181-195 (stage 2)
    # Topic 2: 151-165 (stage 1), 196-210 (stage 2)  
    # Topic 3: 166-180 (stage 1), 211-225 (stage 2)
    if actual_stage == 1:
        if actual_topic_id == 1:
            question_ids = list(range(136, 151))  # IDs 136-150
        elif actual_topic_id == 2:
            question_ids = list(range(151, 166))  # IDs 151-165
        elif actual_topic_id == 3:
            question_ids = list(range(166, 181))  # IDs 166-180
        else:
            raise ValueError(f"Retention test not available for topic {actual_topic_id}")
    elif actual_stage == 2:
        if actual_topic_id == 1:
            question_ids = list(range(181, 196))  # IDs 181-195
        elif actual_topic_id == 2:
            question_ids = list(range(196, 211))  # IDs 196-210
        elif actual_topic_id == 3:
            question_ids = list(range(211, 226))  # IDs 211-225
        else:
            raise ValueError(f"Retention test not available for topic {actual_topic_id}")
    else:
        # Fallback to all retention test question ranges
        question_ids = list(range(136, 226))
    
    # Get the specific questions used in this retention test
    result = await db.execute(
        select(AssessmentQuestion).where(
            AssessmentQuestion.id.in_(question_ids)
        )
    )
    all_questions = result.scalars().all()
    
    # Get subtopics for grouping (we'll group by the subtopics of the questions we actually used)
    subtopics = await get_subtopics_for_topic(db, topic_id)
    
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
    
    # Group questions by subtopic using static mapping for retention tests
    # Questions 1-5 (IDs 136-140) → Subtopic 1
    # Questions 6-10 (IDs 141-145) → Subtopic 2  
    # Questions 11-15 (IDs 146-150) → Subtopic 3
    
    # Sort questions by ID to ensure correct order
    all_questions.sort(key=lambda q: q.id)
    
    # Create static mapping for retention test questions
    retention_test_mapping = [
        {"start_idx": 0, "end_idx": 5, "subtopic_index": 0},   # Questions 1-5 → Subtopic 1
        {"start_idx": 5, "end_idx": 10, "subtopic_index": 1},  # Questions 6-10 → Subtopic 2
        {"start_idx": 10, "end_idx": 15, "subtopic_index": 2}  # Questions 11-15 → Subtopic 3
    ]
    
    # Build results for each subtopic using static mapping
    for mapping in retention_test_mapping:
        subtopic_index = mapping["subtopic_index"]
        start_idx = mapping["start_idx"]
        end_idx = mapping["end_idx"]
        
        # Get subtopic info
        if subtopic_index < len(subtopics):
            subtopic = subtopics[subtopic_index]
            subtopic_id = subtopic.subtopic_id
            subtopic_name = subtopic.title
        else:
            # Fallback if not enough subtopics
            subtopic_id = f"subtopic_{subtopic_index + 1}"
            subtopic_name = f"Subtopic {subtopic_index + 1}"
        
        # Get questions for this subtopic range
        subtopic_questions = all_questions[start_idx:end_idx]
        
        # Filter questions that were actually answered in the retention test
        answered_questions = []
        for q in subtopic_questions:
                if str(q.id) in retention_test.questions_answers:
                    answered_questions.append(q)
        
        # Build subtopic results
        subtopic_results = {
            "id": subtopic_id,
            "name": subtopic_name,
            "questions": [],
            "correctCount": 0,
            "totalCount": len(answered_questions)
        }
        
        for question in answered_questions:
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
        
        # Add subtopic results (even if no questions answered, to show structure)
        results["questionsBySubtopic"][subtopic_id] = subtopic_results
    
    return results
