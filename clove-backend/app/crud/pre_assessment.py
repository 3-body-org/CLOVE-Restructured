# app/crud/pre_assessment.py
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
from typing import Dict, Any, Optional, Tuple
from app.db.models.pre_assessments import PreAssessment
from app.db.models.assessment_questions import AssessmentQuestion
from app.db.models.user_topics import UserTopic
from app.schemas.pre_assessment import PreAssessmentCreate, PreAssessmentUpdate
from app.crud.user_subtopic import update_knowledge_levels_from_assessment
from app.crud.user_subtopic import unlock_first_subtopic_for_user

async def get_by_id(db: AsyncSession, pre_id: int) -> PreAssessment | None:
    result = await db.execute(select(PreAssessment).where(PreAssessment.pre_assessment_id == pre_id))
    return result.scalars().first()

async def list_for_user_topic(db: AsyncSession, user_id: int, topic_id: int) -> list[PreAssessment]:
    result = await db.execute(
        select(PreAssessment)
        .join(PreAssessment.user_topic)
        .where(
            PreAssessment.user_topic.has(user_id=user_id, topic_id=topic_id)
        )
    )
    return result.scalars().all()

async def list_for_user(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100) -> list[PreAssessment]:
    """Get all pre-assessments for a specific user across all topics"""
    result = await db.execute(
        select(PreAssessment)
        .join(PreAssessment.user_topic)
        .where(PreAssessment.user_topic.has(user_id=user_id))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def create(db: AsyncSession, pre_in: PreAssessmentCreate) -> PreAssessment:
    new_pre = PreAssessment(
        user_topic_id=pre_in.user_topic_id,
        total_score=pre_in.total_score,
        total_items=pre_in.total_items,
        is_unlocked=pre_in.is_unlocked,
        subtopic_scores=pre_in.subtopic_scores,
        questions_answers_iscorrect=pre_in.questions_answers_iscorrect,
        attempt_count=pre_in.attempt_count,
        is_completed=pre_in.is_completed
    )
    db.add(new_pre)
    await db.commit()
    await db.refresh(new_pre)
    return new_pre

async def update(db: AsyncSession, pre_db: PreAssessment, pre_in: PreAssessmentUpdate) -> PreAssessment:
    # Use explicit UPDATE to ensure JSON fields are updated
    await db.execute(
        update(PreAssessment)
        .where(PreAssessment.pre_assessment_id == pre_db.pre_assessment_id)
        .values(
            total_score=round(pre_in.total_score, 2),
            total_items=pre_in.total_items,
            is_unlocked=pre_in.is_unlocked,
            subtopic_scores=pre_in.subtopic_scores,
            questions_answers_iscorrect=pre_in.questions_answers_iscorrect,
            attempt_count=pre_in.attempt_count,
            is_completed=pre_in.is_completed
        )
    )
    await db.commit()
    await db.refresh(pre_db)
    return pre_db

async def delete(db: AsyncSession, pre_db: PreAssessment) -> None:
    await db.delete(pre_db)
    await db.commit()

async def reset_assessment(db: AsyncSession, pre_db: PreAssessment) -> PreAssessment:
    """Resets an assessment record to its default state."""
    pre_db.total_score = 0.0
    pre_db.total_items = 0
    pre_db.subtopic_scores = {}
    pre_db.questions_answers_iscorrect = {}
    pre_db.attempt_count = 0
    pre_db.is_completed = False # Reset is_completed
    db.add(pre_db)
    await db.commit()
    await db.refresh(pre_db)
    return pre_db

# New functions for answer submission logic
async def get_user_topic(db: AsyncSession, user_topic_id: int) -> Optional[UserTopic]:
    """Get user topic by ID"""
    result = await db.execute(select(UserTopic).where(UserTopic.id == user_topic_id))
    return result.scalar_one_or_none()

async def get_or_create_user_topic(db: AsyncSession, user_id: int, topic_id: int) -> UserTopic:
    """Get existing user_topic or create new one"""
    # First try to get existing
    result = await db.execute(
        select(UserTopic).where(
            UserTopic.user_id == user_id,
            UserTopic.topic_id == topic_id
        )
    )
    user_topic = result.scalar_one_or_none()
    
    if user_topic:
        return user_topic
    
    # Create new user_topic if doesn't exist
    new_user_topic = UserTopic(
        user_id=user_id,
        topic_id=topic_id,
        progress_percent=0.0,
        knowledge_level=0.0,
        is_unlocked=True
    )
    db.add(new_user_topic)
    await db.commit()
    await db.refresh(new_user_topic)
    return new_user_topic

async def get_question(db: AsyncSession, question_id: int) -> Optional[AssessmentQuestion]:
    """Get assessment question by ID"""
    result = await db.execute(select(AssessmentQuestion).where(AssessmentQuestion.id == question_id))
    return result.scalar_one_or_none()

async def get_questions_by_ids(db: AsyncSession, question_ids: list[int]) -> Dict[int, AssessmentQuestion]:
    """Get multiple assessment questions by IDs"""
    result = await db.execute(select(AssessmentQuestion).where(AssessmentQuestion.id.in_(question_ids)))
    return {q.id: q for q in result.scalars().all()}

async def get_existing_pre_assessment(db: AsyncSession, user_topic_id: int) -> Optional[PreAssessment]:
    """Get existing pre assessment for user topic"""
    result = await db.execute(select(PreAssessment).where(PreAssessment.user_topic_id == user_topic_id))
    return result.scalar_one_or_none()

async def submit_single_answer(
    db: AsyncSession, 
    user_id: int,
    topic_id: int,
    question_id: int, 
    user_answer: Any
) -> Dict[str, Any]:
    """Submit a single answer and update assessment progress"""
    
    # Get or create user_topic relationship
    user_topic = await get_or_create_user_topic(db, user_id, topic_id)
    
    # Get the question
    question = await get_question(db, question_id)
    if not question:
        raise ValueError("Question not found")
    
    # Check if answer is correct
    correct_answer = question.question_choices_correctanswer.get('correct_answer')
    is_correct = user_answer == correct_answer
    
    # Get existing pre_assessment record
    existing = await get_existing_pre_assessment(db, user_topic.id)
    
    if not existing:
        raise ValueError("Pre-assessment record not found. Please ensure user data is initialized.")
    
    # Check if this is 2nd attempt and if 1st attempt was complete
    if existing.attempt_count >= 1 and existing.total_items >= 15:
        raise ValueError("Cannot take 2nd attempt. First attempt was already completed.")
    
    # Check if maximum attempts reached
    if existing.attempt_count >= 2:
        raise ValueError("Maximum attempts (2) reached for this assessment")
    
    return await _update_existing_assessment(db, existing, question_id, user_answer, correct_answer, is_correct, user_topic)

async def _update_existing_assessment(
    db: AsyncSession,
    existing: PreAssessment,
    question_id: int,
    user_answer: Any,
    correct_answer: Any,
    is_correct: bool,
    user_topic: UserTopic
) -> Dict[str, Any]:
    """Update existing assessment with new answer. Recalculates all scores on each submission for consistency."""
    questions_answers = (existing.questions_answers_iscorrect or {}).copy()
    
    s_question_id = str(question_id)

    # If this is the start of a second attempt, reset previous answers
    if existing.attempt_count == 1 and existing.total_items < 15 and s_question_id not in questions_answers:
        questions_answers = {}
    
    # Update the specific answer, now including the correct_answer
    questions_answers[s_question_id] = {
        'user_answer': user_answer,
        'correct_answer': correct_answer,
        'is_correct': is_correct
    }
    
    # Recalculate subtopic_scores from scratch for consistency
    subtopic_scores_counts = {}
    all_answered_qids = [int(qid_str) for qid_str in questions_answers.keys()]
    
    if all_answered_qids:
        all_questions = await get_questions_by_ids(db, all_answered_qids)
        for q_id_str, answer_data in questions_answers.items():
            q_id_int = int(q_id_str)
            if q_id_int in all_questions:
                q_subtopic_id_str = str(all_questions[q_id_int].subtopic_id)
                
                if q_subtopic_id_str not in subtopic_scores_counts:
                    subtopic_scores_counts[q_subtopic_id_str] = {'correct': 0, 'total': 0}
                
                subtopic_scores_counts[q_subtopic_id_str]['total'] += 1
                if answer_data.get('is_correct'):
                    subtopic_scores_counts[q_subtopic_id_str]['correct'] += 1

    # Convert counts to percentage scores for storage
    subtopic_scores = {
        sid: round(scores['correct'] / scores['total'], 2) if scores['total'] > 0 else 0.0
        for sid, scores in subtopic_scores_counts.items()
    }

    # Recalculate total score and items from the counts
    total_correct = sum(score.get('correct', 0) for score in subtopic_scores_counts.values())
    total_items = sum(score.get('total', 0) for score in subtopic_scores_counts.values())
    
    # When an attempt is completed, decide the denominator for scoring
    is_attempt_completed = total_items >= 15 and existing.total_items < 15

    if is_attempt_completed:
        # The attempt is now finished, use 15 as the denominator
        denominator = 15
        final_score = (total_correct / denominator) * 100
        if existing.attempt_count < 2:
            existing.attempt_count += 1
        existing.is_completed = True # Mark as completed
        # Unlock the first subtopic for this user/topic
        await unlock_first_subtopic_for_user(db, user_topic.user_id, user_topic.topic_id)
    else:
        # The attempt is still in progress, score based on answered questions
        final_score = (total_correct / total_items) * 100 if total_items > 0 else 0
    
    # Update the record
    existing.questions_answers_iscorrect = questions_answers
    existing.subtopic_scores = subtopic_scores
    existing.total_score = round(final_score, 2)
    existing.total_items = total_items
    
    await db.commit()
    await db.refresh(existing)
    
    # Always update knowledge levels (even incomplete attempts), passing the detailed counts
    await update_knowledge_levels_from_assessment(db, user_topic.user_id, subtopic_scores_counts)
    
    return {
        "message": "Answer submitted successfully",
        "is_correct": is_correct,
        "correct_answer": correct_answer,
        "progress": {
            "total_answered": total_items,
            "total_correct": total_correct,
            "score_percentage": final_score,
            "attempt_count": existing.attempt_count,
            "can_retry": existing.attempt_count < 2 and existing.total_items < 15
        }
    }

async def submit_multiple_answers(
    db: AsyncSession,
    user_id: int,
    topic_id: int,
    answers: Dict[int, Any]
) -> PreAssessment:
    """Submit all assessment answers at once and calculate scores, applying penalty for incomplete tests."""
    
    # Get or create user_topic relationship
    user_topic = await get_or_create_user_topic(db, user_id, topic_id)
    
    # Get all questions that were answered
    question_ids = list(answers.keys())
    questions = await get_questions_by_ids(db, question_ids)
    
    if len(questions) != len(question_ids):
        raise ValueError("Some question IDs are invalid")
    
    # Get existing pre assessment
    existing = await get_existing_pre_assessment(db, user_topic.id)
    
    if not existing:
        raise ValueError("Pre-assessment record not found. Please ensure user data is initialized.")
    
    # Check if this is 2nd attempt and if 1st attempt was complete
    if existing.attempt_count >= 1 and existing.total_items >= 15:
        raise ValueError("Cannot take 2nd attempt. First attempt was already completed.")
    
    # Check if maximum attempts reached
    if existing.attempt_count >= 2:
        raise ValueError("Maximum attempts (2) reached for this assessment")
    
    # Calculate scores
    questions_answers = {}
    subtopic_scores_counts = {}
    
    for question_id, user_answer in answers.items():
        question = questions[question_id]
        correct_answer = question.question_choices_correctanswer.get('correct_answer')
        is_correct = user_answer == correct_answer
        
        questions_answers[str(question_id)] = {
            'user_answer': user_answer,
            'correct_answer': correct_answer,
            'is_correct': is_correct
        }
        
        # Update subtopic scores
        subtopic_id = str(question.subtopic_id)
        if subtopic_id not in subtopic_scores_counts:
            subtopic_scores_counts[subtopic_id] = {'correct': 0, 'total': 0}
        
        subtopic_scores_counts[subtopic_id]['total'] += 1
        if is_correct:
            subtopic_scores_counts[subtopic_id]['correct'] += 1
    
    # Convert counts to percentage scores for storage
    subtopic_scores = {
        sid: round(scores['correct'] / scores['total'], 2) if scores['total'] > 0 else 0.0
        for sid, scores in subtopic_scores_counts.items()
    }
    
    # Calculate total score, applying penalty for incomplete submissions
    total_correct = sum(score.get('correct', 0) for score in subtopic_scores_counts.values())
    total_items = len(answers)
    
    # Use 15 as the denominator if the user submits fewer than 15 answers
    denominator = 15 if total_items < 15 else total_items
    final_score = (total_correct / denominator) * 100 if denominator > 0 else 0
    
    # Since this is a submission, the attempt is considered completed.
    if existing.attempt_count < 2:
        existing.attempt_count += 1
    
    # Update the record
    existing.questions_answers_iscorrect = questions_answers
    existing.subtopic_scores = subtopic_scores
    existing.total_score = round(final_score, 2)
    existing.total_items = total_items
    existing.is_completed = True # Mark as completed
    
    await db.commit()
    await db.refresh(existing)
    
    # Always update knowledge levels
    await update_knowledge_levels_from_assessment(db, user_topic.user_id, subtopic_scores_counts)
    
    return existing
