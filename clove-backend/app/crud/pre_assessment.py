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
from app.crud.assessment_question import get_questions_by_ids

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
        attempt_count=pre_in.attempt_count
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
            attempt_count=pre_in.attempt_count
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
    """Update existing assessment with new answer"""
    questions_answers = existing.questions_answers_iscorrect or {}
    subtopic_scores = existing.subtopic_scores or {}
    
    # Update the specific answer
    questions_answers[question_id] = {
        'user_answer': user_answer,
        'correct_answer': correct_answer,
        'is_correct': is_correct
    }
    
    # Get question for subtopic_id
    question = await get_question(db, question_id)
    subtopic_id = question.subtopic_id
    
    # Update subtopic scores
    if subtopic_id not in subtopic_scores:
        subtopic_scores[subtopic_id] = {'correct': 0, 'total': 0}
    
    # Remove previous answer for this question if it exists
    if question_id in questions_answers:
        prev_answer = questions_answers[question_id]
        if prev_answer.get('is_correct'):
            subtopic_scores[subtopic_id]['correct'] -= 1
        subtopic_scores[subtopic_id]['total'] -= 1
    
    # Add new answer
    if is_correct:
        subtopic_scores[subtopic_id]['correct'] += 1
    subtopic_scores[subtopic_id]['total'] += 1
    
    # Calculate total score
    total_correct = sum(1 for ans in questions_answers.values() if ans.get('is_correct'))
    total_items = len(questions_answers)
    final_score = (total_correct / total_items) * 100 if total_items > 0 else 0
    
    # Check if this is a new attempt (first submission or starting 2nd attempt)
    is_new_attempt = (
        # First time ever answering (1st attempt)
        (existing.total_items == 0 and total_items > 0) 
        or 
        # Starting 2nd attempt (after incomplete 1st)
        (existing.attempt_count == 1 and existing.total_items < 15 and total_items > 0)
    )
    
    # Increment attempt count if this is a new attempt
    if is_new_attempt and existing.attempt_count < 2:
        existing.attempt_count += 1
    
    # Update the record
    existing.questions_answers_iscorrect = questions_answers
    existing.subtopic_scores = subtopic_scores
    existing.total_score = final_score
    existing.total_items = total_items
    
    await db.commit()
    await db.refresh(existing)
    
    # Always update knowledge levels (even incomplete attempts)
    await update_knowledge_levels_from_assessment(db, user_topic.user_id, subtopic_scores)
    
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
    """Submit all assessment answers at once and calculate scores"""
    
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
    subtopic_scores = {}
    
    for question_id, user_answer in answers.items():
        question = questions[question_id]
        correct_answer = question.question_choices_correctanswer.get('correct_answer')
        is_correct = user_answer == correct_answer
        
        questions_answers[question_id] = {
            'user_answer': user_answer,
            'correct_answer': correct_answer,
            'is_correct': is_correct
        }
        
        # Update subtopic scores
        subtopic_id = question.subtopic_id
        if subtopic_id not in subtopic_scores:
            subtopic_scores[subtopic_id] = {'correct': 0, 'total': 0}
        
        if is_correct:
            subtopic_scores[subtopic_id]['correct'] += 1
        subtopic_scores[subtopic_id]['total'] += 1
    
    # Calculate total score
    total_correct = sum(1 for ans in questions_answers.values() if ans.get('is_correct'))
    total_items = len(questions_answers)
    final_score = (total_correct / total_items) * 100 if total_items > 0 else 0
    
    # Check if this is a new attempt (first submission or starting 2nd attempt)
    is_new_attempt = (
        # First time ever answering (1st attempt)
        (existing.total_items == 0 and total_items > 0) 
        or 
        # Starting 2nd attempt (after incomplete 1st)
        (existing.attempt_count == 1 and existing.total_items < 15 and total_items > 0)
    )
    
    # Increment attempt count if this is a new attempt
    if is_new_attempt and existing.attempt_count < 2:
        existing.attempt_count += 1
    
    # Update the record
    existing.questions_answers_iscorrect = questions_answers
    existing.subtopic_scores = subtopic_scores
    existing.total_score = final_score
    existing.total_items = total_items
    
    await db.commit()
    await db.refresh(existing)
    
    # Always update knowledge levels (even incomplete attempts)
    await update_knowledge_levels_from_assessment(db, user_topic.user_id, subtopic_scores)
    
    return existing
