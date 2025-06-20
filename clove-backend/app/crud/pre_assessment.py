# app/crud/pre_assessment.py
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
from typing import Dict, Any, Optional, Tuple
from app.db.models.pre_assessments import PreAssessment
from app.db.models.assessment_questions import AssessmentQuestion
from app.db.models.user_topics import UserTopic
from app.schemas.pre_assessment import PreAssessmentCreate, PreAssessmentUpdate

async def get_by_id(db: AsyncSession, pre_id: int) -> PreAssessment | None:
    result = await db.execute(select(PreAssessment).where(PreAssessment.pre_assessment_id == pre_id))
    return result.scalars().first()

async def list_for_user_topic(db: AsyncSession, user_id: int, topic_id: int) -> list[PreAssessment]:
    result = await db.execute(
        select(PreAssessment).where(
            PreAssessment.user_id == user_id,
            PreAssessment.topic_id == topic_id
        )
    )
    return result.scalars().all()

async def create(db: AsyncSession, pre_in: PreAssessmentCreate) -> PreAssessment:
    new_pre = PreAssessment(
        user_id=pre_in.user_id,
        topic_id=pre_in.topic_id,
        total_score=pre_in.total_score,
        total_items=pre_in.total_items,
        is_unlocked=pre_in.is_unlocked,
        subtopic_scores=pre_in.subtopic_scores,
        questions_answers_iscorrect=pre_in.questions_answers_iscorrect
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
            questions_answers_iscorrect=pre_in.questions_answers_iscorrect
        )
    )
    await db.commit()
    await db.refresh(pre_db)
    return pre_db

async def delete(db: AsyncSession, pre_db: PreAssessment) -> None:
    await db.delete(pre_db)
    await db.commit()

# New functions for answer submission logic
async def get_user_topic(db: AsyncSession, user_topic_id: int) -> Optional[UserTopic]:
    """Get user topic by ID"""
    result = await db.execute(select(UserTopic).where(UserTopic.id == user_topic_id))
    return result.scalar_one_or_none()

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
    user_topic_id: int, 
    question_id: int, 
    user_answer: Any
) -> Dict[str, Any]:
    """Submit a single answer and update assessment progress"""
    
    # Get the user_topic to verify it exists
    user_topic = await get_user_topic(db, user_topic_id)
    if not user_topic:
        raise ValueError("UserTopic not found")
    
    # Get the question
    question = await get_question(db, question_id)
    if not question:
        raise ValueError("Question not found")
    
    # Check if answer is correct
    correct_answer = question.question_choices_correctanswer.get('correct_answer')
    is_correct = user_answer == correct_answer
    
    # Get or create pre_assessment record
    existing = await get_existing_pre_assessment(db, user_topic_id)
    
    if existing:
        return await _update_existing_assessment(db, existing, question_id, user_answer, correct_answer, is_correct)
    else:
        return await _create_new_assessment(db, user_topic_id, question_id, user_answer, correct_answer, is_correct, question.subtopic_id)

async def _update_existing_assessment(
    db: AsyncSession,
    existing: PreAssessment,
    question_id: int,
    user_answer: Any,
    correct_answer: Any,
    is_correct: bool
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
    
    # Convert to percentages
    for st_id in subtopic_scores:
        correct = subtopic_scores[st_id]['correct']
        total = subtopic_scores[st_id]['total']
        subtopic_scores[st_id] = (correct / total) * 100 if total > 0 else 0
    
    # Calculate total score
    total_correct = sum(1 for ans in questions_answers.values() if ans.get('is_correct'))
    total_items = len(questions_answers)
    final_score = (total_correct / total_items) * 100 if total_items > 0 else 0
    
    # Update the record
    existing.questions_answers_iscorrect = questions_answers
    existing.subtopic_scores = subtopic_scores
    existing.total_score = final_score
    existing.total_items = total_items
    
    await db.commit()
    await db.refresh(existing)
    
    return {
        "message": "Answer submitted successfully",
        "is_correct": is_correct,
        "correct_answer": correct_answer,
        "progress": {
            "total_answered": total_items,
            "total_correct": total_correct,
            "score_percentage": final_score
        }
    }

async def _create_new_assessment(
    db: AsyncSession,
    user_topic_id: int,
    question_id: int,
    user_answer: Any,
    correct_answer: Any,
    is_correct: bool,
    subtopic_id: int
) -> Dict[str, Any]:
    """Create new assessment with first answer"""
    questions_answers = {
        question_id: {
            'user_answer': user_answer,
            'correct_answer': correct_answer,
            'is_correct': is_correct
        }
    }
    
    subtopic_scores = {
        subtopic_id: 100.0 if is_correct else 0.0
    }
    
    new_pre_assessment = PreAssessment(
        user_topic_id=user_topic_id,
        total_score=100.0 if is_correct else 0.0,
        total_items=1,
        subtopic_scores=subtopic_scores,
        questions_answers_iscorrect=questions_answers,
        is_unlocked=True
    )
    
    db.add(new_pre_assessment)
    await db.commit()
    await db.refresh(new_pre_assessment)
    
    return {
        "message": "Answer submitted successfully",
        "is_correct": is_correct,
        "correct_answer": correct_answer,
        "progress": {
            "total_answered": 1,
            "total_correct": 1 if is_correct else 0,
            "score_percentage": 100.0 if is_correct else 0.0
        }
    }

async def submit_multiple_answers(
    db: AsyncSession,
    user_topic_id: int,
    answers: Dict[int, Any]
) -> PreAssessment:
    """Submit all assessment answers at once and calculate scores"""
    
    # Get the user_topic to verify it exists
    user_topic = await get_user_topic(db, user_topic_id)
    if not user_topic:
        raise ValueError("UserTopic not found")
    
    # Get all questions that were answered
    question_ids = list(answers.keys())
    questions = await get_questions_by_ids(db, question_ids)
    
    if len(questions) != len(question_ids):
        raise ValueError("Some question IDs are invalid")
    
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
    
    # Convert subtopic scores to percentages
    for subtopic_id in subtopic_scores:
        correct = subtopic_scores[subtopic_id]['correct']
        total = subtopic_scores[subtopic_id]['total']
        subtopic_scores[subtopic_id] = (correct / total) * 100 if total > 0 else 0
    
    # Calculate total score
    total_correct = sum(1 for ans in questions_answers.values() if ans.get('is_correct'))
    total_items = len(questions_answers)
    final_score = (total_correct / total_items) * 100 if total_items > 0 else 0
    
    # Get or create pre assessment
    existing = await get_existing_pre_assessment(db, user_topic_id)
    
    if existing:
        existing.questions_answers_iscorrect = questions_answers
        existing.subtopic_scores = subtopic_scores
        existing.total_score = final_score
        existing.total_items = total_items
        await db.commit()
        await db.refresh(existing)
        return existing
    else:
        new_pre_assessment = PreAssessment(
            user_topic_id=user_topic_id,
            total_score=final_score,
            total_items=total_items,
            subtopic_scores=subtopic_scores,
            questions_answers_iscorrect=questions_answers,
            is_unlocked=True
        )
        db.add(new_pre_assessment)
        await db.commit()
        await db.refresh(new_pre_assessment)
        return new_pre_assessment
