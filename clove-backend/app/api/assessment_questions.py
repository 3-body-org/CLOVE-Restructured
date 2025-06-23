# app/api/assessment_questions.py
from typing import List, Optional
from enum import Enum
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
from app.api.auth import get_current_user, get_current_superuser
from app.db.models.users import User

router = APIRouter(prefix="/assessment_questions", tags=["AssessmentQuestions"])

class AssessmentType(str, Enum):
    pre = "pre"
    post = "post"

@router.post("/", response_model=AssessmentQuestionRead, status_code=status.HTTP_201_CREATED)
async def create_question(
    ques_in: AssessmentQuestionCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Create a new question. Requires superuser privileges."""
    created = await create(db, ques_in)
    return created

@router.get("/{question_id}", response_model=AssessmentQuestionRead)
async def read_question(
    question_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """Get a specific question by ID. Public endpoint for reading."""
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
    """List questions for a subtopic. Public endpoint for reading."""
    if subtopic_id is None:
        raise HTTPException(status_code=400, detail="subtopic_id query parameter is required")
    return await list_for_subtopic(db, subtopic_id=subtopic_id, skip=skip, limit=limit)

@router.get("/topic/{topic_id}/randomized", response_model=List[AssessmentQuestionRead])
async def get_randomized_questions_for_topic_endpoint(
    topic_id: int,
    assessment_type: AssessmentType,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        questions = await get_randomized_questions_for_topic(
            db, 
            topic_id=topic_id, 
            user_id=current_user.id,
            assessment_type=assessment_type.value
        )
        return questions
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/topic/{topic_id}/randomized/summary")
async def get_randomized_questions_summary_endpoint(
    topic_id: int,
    assessment_type: AssessmentType,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a summary of randomized questions for a topic.
    Returns question IDs and metadata for frontend to track progress.
    Requires user authentication.
    """
    try:
        summary = await get_randomized_questions_summary(
            db, 
            topic_id=topic_id, 
            user_id=current_user.id,
            assessment_type=assessment_type.value
        )
        return summary
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{question_id}", response_model=AssessmentQuestionRead)
async def update_question(
    question_id: int, 
    ques_in: AssessmentQuestionUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Update a question. Requires superuser privileges."""
    ques_obj = await get_by_id(db, question_id=question_id)
    if not ques_obj:
        raise HTTPException(status_code=404, detail="Question not found")
    updated = await update(db, ques_obj, ques_in)
    return updated

@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Delete a question. Requires superuser privileges."""
    ques_obj = await get_by_id(db, question_id=question_id)
    if not ques_obj:
        raise HTTPException(status_code=404, detail="Question not found")
    await delete(db, ques_obj)
    return
