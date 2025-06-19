# app/api/assessment_questions.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession 
from app.schemas.assessment_question import AssessmentQuestionRead, AssessmentQuestionCreate, AssessmentQuestionUpdate
from app.crud.assessment_question import (
    get_by_id, 
    list_for_subtopic, 
    create, 
    update, 
    delete,
    get_randomized_questions_for_topic,
    get_randomized_questions_summary
)
from app.db.session import get_db

router = APIRouter(prefix="/assessment_questions", tags=["AssessmentQuestions"])

@router.post("/", response_model=AssessmentQuestionRead, status_code=status.HTTP_201_CREATED)
async def create_question(ques_in: AssessmentQuestionCreate, db: AsyncSession = Depends(get_db)):
    created = await create(db, ques_in)
    return created

@router.get("/{question_id}", response_model=AssessmentQuestionRead)
async def read_question(question_id: int, db: AsyncSession = Depends(get_db)):
    ques_obj = await get_by_id(db, question_id=question_id)
    if not ques_obj:
        raise HTTPException(status_code=404, detail="Question not found")
    return ques_obj

@router.get("/", response_model=List[AssessmentQuestionRead])
async def list_questions(
    subtopic_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    if subtopic_id is None:
        raise HTTPException(status_code=400, detail="subtopic_id query parameter is required")
    return await list_for_subtopic(db, subtopic_id=subtopic_id, skip=skip, limit=limit)

@router.get("/topic/{topic_id}/randomized", response_model=List[AssessmentQuestionRead])
async def get_randomized_questions_for_topic_endpoint(
    topic_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get 15 randomized assessment questions from a topic:
    - 5 easy questions
    - 5 medium questions  
    - 5 hard questions
    - Distributed across all subtopics in the topic
    Returns questions in order for one-by-one display
    """
    try:
        questions = await get_randomized_questions_for_topic(db, topic_id)
        return questions
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/topic/{topic_id}/randomized/summary")
async def get_randomized_questions_summary_endpoint(
    topic_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a summary of randomized questions for a topic.
    Returns question IDs and metadata for frontend to track progress.
    """
    try:
        summary = await get_randomized_questions_summary(db, topic_id)
        return summary
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{question_id}", response_model=AssessmentQuestionRead)
async def update_question(question_id: int, ques_in: AssessmentQuestionUpdate, db: AsyncSession = Depends(get_db)):
    ques_obj = await get_by_id(db, question_id=question_id)
    if not ques_obj:
        raise HTTPException(status_code=404, detail="Question not found")
    updated = await update(db, ques_obj, ques_in)
    return updated

@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(question_id: int, db: AsyncSession = Depends(get_db)):
    ques_obj = await get_by_id(db, question_id=question_id)
    if not ques_obj:
        raise HTTPException(status_code=404, detail="Question not found")
    await delete(db, ques_obj)
    return
