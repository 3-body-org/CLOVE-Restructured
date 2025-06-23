# app/crud/assessment_question.py
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import random
from typing import List, Dict, Any
from app.db.models.assessment_questions import AssessmentQuestion
from app.db.models.subtopics import Subtopic
from app.schemas.assessment_question import AssessmentQuestionCreate, AssessmentQuestionUpdate
from app.crud.pre_assessment import list_for_user_topic as get_pre_assessment_for_user_topic
from app.crud.post_assessment import list_for_user_topic as get_post_assessment_for_user_topic

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
    - For post-assessments, it reuses questions from a completed pre-assessment.
    - For second attempts, questions from the first attempt are excluded.
    """
    
    # If this is for a post-assessment, check pre-assessment status first.
    if assessment_type == 'post':
        pre_assessments = await get_pre_assessment_for_user_topic(db, user_id, topic_id)
        if pre_assessments:
            pre_assessment = pre_assessments[0]
            # If pre-assessment was completed (15+ items), reuse the same questions.
            if pre_assessment.total_items >= 15 and pre_assessment.questions_answers_iscorrect:
                question_ids_to_reuse = [int(qid) for qid in pre_assessment.questions_answers_iscorrect.keys()]
                reused_questions = await get_questions_by_ids(db, question_ids_to_reuse)
                random.shuffle(reused_questions) # Shuffle to make the order different
                return reused_questions

    # Determine which questions to exclude from the random pool.
    answered_question_ids = set()
    
    # For a post-assessment, exclude any questions from an incomplete pre-assessment.
    if assessment_type == 'post':
        pre_assessments = await get_pre_assessment_for_user_topic(db, user_id, topic_id)
        if pre_assessments and pre_assessments[0].questions_answers_iscorrect:
            answered_question_ids.update(int(qid) for qid in pre_assessments[0].questions_answers_iscorrect.keys())

    # Always exclude questions from previous attempts of the *same* assessment type.
    current_assessment_list = []
    if assessment_type == 'pre':
        current_assessment_list = await get_pre_assessment_for_user_topic(db, user_id, topic_id)
    else: # 'post'
        current_assessment_list = await get_post_assessment_for_user_topic(db, user_id, topic_id)

    if current_assessment_list and current_assessment_list[0].questions_answers_iscorrect:
        answered_question_ids.update(int(qid) for qid in current_assessment_list[0].questions_answers_iscorrect.keys())
    
    # First, get all subtopics for this topic
    subtopics = await get_subtopics_for_topic(db, topic_id)
    
    if not subtopics:
        raise ValueError(f"No subtopics found for topic_id {topic_id}")
    
    subtopic_ids = [subtopic.subtopic_id for subtopic in subtopics]
    
    # Get all questions for all subtopics in this topic
    all_questions = await get_questions_for_subtopics(db, subtopic_ids)

    # Filter out questions that have already been answered
    if answered_question_ids:
        all_questions = [q for q in all_questions if q.id not in answered_question_ids]
    
    if not all_questions:
        raise ValueError(f"No new assessment questions found for topic_id {topic_id} for this attempt.")
    
    # Group questions by subtopic
    questions_by_subtopic = {}
    for question in all_questions:
        subtopic_id = question.subtopic_id
        if subtopic_id not in questions_by_subtopic:
            questions_by_subtopic[subtopic_id] = []
        questions_by_subtopic[subtopic_id].append(question)
    
    # Select random questions per subtopic
    selected_questions = []
    
    for subtopic_id in subtopic_ids:
        available_questions = questions_by_subtopic.get(subtopic_id, [])
        
        if len(available_questions) < questions_per_subtopic:
            raise ValueError(
                f"Not enough new questions available for subtopic {subtopic_id}. "
                f"Need {questions_per_subtopic}, but only {len(available_questions)} found."
            )
        
        # Randomly select questions for this subtopic
        selected_for_subtopic = random.sample(available_questions, questions_per_subtopic)
        selected_questions.extend(selected_for_subtopic)
    
    # Shuffle the final list to randomize the order
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
                "subtopic_name": q.subtopic.subtopic_name if q.subtopic else None,
                "question_number": i + 1
            }
            for i, q in enumerate(questions)
        ]
    }
    
    return summary
