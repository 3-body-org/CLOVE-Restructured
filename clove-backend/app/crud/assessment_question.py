# app/crud/assessment_question.py
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import random
from typing import List, Dict, Any, Optional
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
    - For post-assessments, it reuses the full set of questions from a completed pre-assessment.
    - For pre-assessments, it automatically provides the remaining number of questions for an incomplete attempt,
      while maintaining the subtopic balance.
    """
    
    # If this is for a post-assessment, check pre-assessment status first.
    if assessment_type == 'post':
        pre_assessments = await get_pre_assessment_for_user_topic(db, user_id, topic_id)
        if pre_assessments:
            pre_assessment = pre_assessments[0]
            # If pre-assessment was completed, reuse the same full set of questions.
            if pre_assessment.total_items >= 15 and pre_assessment.questions_answers_iscorrect:
                question_ids_to_reuse = [int(qid) for qid in pre_assessment.questions_answers_iscorrect.keys()]
                reused_questions = await get_questions_by_ids(db, question_ids_to_reuse)
                random.shuffle(reused_questions)
                return reused_questions

    # Determine which questions to exclude from the random pool.
    answered_question_ids = set()
    answered_count_by_subtopic = {}

    current_assessment_list = []
    if assessment_type == 'pre':
        current_assessment_list = await get_pre_assessment_for_user_topic(db, user_id, topic_id)
    else: # 'post'
        current_assessment_list = await get_post_assessment_for_user_topic(db, user_id, topic_id)

    if current_assessment_list and current_assessment_list[0].questions_answers_iscorrect:
        answered_qids_str = current_assessment_list[0].questions_answers_iscorrect.keys()
        answered_question_ids.update(int(qid) for qid in answered_qids_str)
        
        # Count answered questions per subtopic to handle resumes intelligently
        if answered_question_ids:
            answered_questions = await get_questions_by_ids(db, list(answered_question_ids))
            for q in answered_questions:
                answered_count_by_subtopic[q.subtopic_id] = answered_count_by_subtopic.get(q.subtopic_id, 0) + 1

    # For a post-assessment, also exclude any questions from an incomplete pre-assessment.
    if assessment_type == 'post':
        pre_assessments = await get_pre_assessment_for_user_topic(db, user_id, topic_id)
        if pre_assessments and pre_assessments[0].questions_answers_iscorrect:
            answered_question_ids.update(int(qid) for qid in pre_assessments[0].questions_answers_iscorrect.keys())
    
    # First, get all subtopics for this topic
    subtopics = await get_subtopics_for_topic(db, topic_id)
    if not subtopics:
        raise ValueError(f"No subtopics found for topic_id {topic_id}")
    
    # Get all questions for all subtopics in this topic
    all_questions = await get_questions_for_subtopics(db, subtopic_ids=[s.subtopic_id for s in subtopics])

    # Filter out all questions that have already been answered
    unanswered_questions = [q for q in all_questions if q.id not in answered_question_ids]
    
    # Group the remaining unanswered questions by subtopic
    questions_by_subtopic = {}
    for question in unanswered_questions:
        subtopic_id = question.subtopic_id
        if subtopic_id not in questions_by_subtopic:
            questions_by_subtopic[subtopic_id] = []
        questions_by_subtopic[subtopic_id].append(question)
    
    # Select questions needed for each subtopic to meet the goal
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
    
    # Shuffle the final list to randomize the order of questions from different subtopics
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
