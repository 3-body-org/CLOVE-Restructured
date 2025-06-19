# app/crud/assessment_question.py
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import random
from typing import List, Dict, Any
from app.db.models.assessment_questions import AssessmentQuestion
from app.db.models.subtopics import Subtopic
from app.schemas.assessment_question import AssessmentQuestionCreate, AssessmentQuestionUpdate

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
    questions_per_difficulty: int = 5
) -> List[AssessmentQuestion]:
    """
    Get randomized assessment questions from a topic:
    - 5 easy questions (or specified amount)
    - 5 medium questions (or specified amount)  
    - 5 hard questions (or specified amount)
    - Distributed across all subtopics in the topic
    
    Returns questions in randomized order for one-by-one display
    """
    
    # First, get all subtopics for this topic
    subtopics = await get_subtopics_for_topic(db, topic_id)
    
    if not subtopics:
        raise ValueError(f"No subtopics found for topic_id {topic_id}")
    
    subtopic_ids = [subtopic.subtopic_id for subtopic in subtopics]
    
    # Get all questions for all subtopics in this topic
    all_questions = await get_questions_for_subtopics(db, subtopic_ids)
    
    if not all_questions:
        raise ValueError(f"No assessment questions found for topic_id {topic_id}")
    
    # Group questions by difficulty
    questions_by_difficulty = {
        'easy': [],
        'medium': [],
        'hard': []
    }
    
    for question in all_questions:
        questions_by_difficulty[question.difficulty].append(question)
    
    # Select random questions per difficulty
    selected_questions = []
    
    for difficulty in ['easy', 'medium', 'hard']:
        available_questions = questions_by_difficulty[difficulty]
        
        if len(available_questions) < questions_per_difficulty:
            raise ValueError(
                f"Not enough {difficulty} questions available. "
                f"Need {questions_per_difficulty}, but only {len(available_questions)} found for topic_id {topic_id}"
            )
        
        # Randomly select questions for this difficulty
        selected_for_difficulty = random.sample(available_questions, questions_per_difficulty)
        selected_questions.extend(selected_for_difficulty)
    
    # Shuffle the final list to randomize the order
    random.shuffle(selected_questions)
    
    return selected_questions

async def get_randomized_questions_summary(
    db: AsyncSession, 
    topic_id: int, 
    questions_per_difficulty: int = 5
) -> Dict[str, Any]:
    """
    Get a summary of randomized questions for a topic.
    Returns question IDs and metadata for frontend to track progress.
    """
    
    # Get the randomized questions
    questions = await get_randomized_questions_for_topic(db, topic_id, questions_per_difficulty)
    
    # Create summary with question IDs and metadata
    summary = {
        "topic_id": topic_id,
        "total_questions": len(questions),
        "questions_per_difficulty": questions_per_difficulty,
        "questions": [
            {
                "id": q.id,
                "difficulty": q.difficulty,
                "subtopic_id": q.subtopic_id,
                "subtopic_name": q.subtopic.subtopic_name if q.subtopic else None,
                "question_number": i + 1
            }
            for i, q in enumerate(questions)
        ]
    }
    
    return summary
