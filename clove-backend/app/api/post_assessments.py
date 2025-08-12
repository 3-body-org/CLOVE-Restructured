# app/api/post_assessments.py
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession 
from app.schemas.post_assessment import PostAssessmentRead, PostAssessmentCreate, PostAssessmentUpdate
from app.crud.post_assessment import (
    get_by_id,
    create,
    update,
    delete,
    list_for_user_topic,
    list_for_user,
    submit_single_answer,
    submit_multiple_answers,
    reset_assessment
)
from app.db.session import get_db
from app.api.auth import get_current_user, get_current_superuser
from app.db.models.users import User
from pydantic import BaseModel

# Add the schema for single answer submission like pre-assessment
class SingleAnswerSubmission(BaseModel):
    user_id: int
    topic_id: int
    question_id: int
    user_answer: Any

router = APIRouter(prefix="/post_assessments", tags=["PostAssessments"])

@router.post("/", response_model=PostAssessmentRead, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_in: PostAssessmentCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new post assessment"""
    created = await create(db, post_in)
    return created

@router.get("/user/{user_id}/topic/{topic_id}", response_model=PostAssessmentRead)
async def read_post(
    user_id: int,
    topic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific post assessment by user and topic"""
    # Users can only view their own post_assessments, superusers can view any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this post assessment")
    
    post_assessments = await list_for_user_topic(db, user_id=user_id, topic_id=topic_id)
    if not post_assessments:
        raise HTTPException(status_code=404, detail="PostAssessment not found")
    
    # Return the first (and should be only) post assessment for this user-topic pair
    return post_assessments[0]

@router.get("/", response_model=List[PostAssessmentRead])
async def list_posts(
    user_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all post assessments for a specific user across all topics"""
    if user_id is None:
        raise HTTPException(status_code=400, detail="user_id query parameter is required")
    
    # Users can only view their own post_assessments, superusers can view any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this user's post assessments")
    
    return await list_for_user(db, user_id=user_id, skip=skip, limit=limit)

@router.post("/submit-single-answer")
async def submit_single_answer_endpoint(
    submission: SingleAnswerSubmission,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a single answer and update assessment progress"""
    # Users can only submit answers for themselves, superusers can submit for any user
    if not current_user.is_superuser and submission.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to submit answers for this user")
    
    try:
        result = await submit_single_answer(
            db,
            submission.user_id,
            submission.topic_id,
            submission.question_id,
            submission.user_answer
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/submit-answers", response_model=PostAssessmentRead)
async def submit_assessment_answers_endpoint(
    user_id: int,
    topic_id: int,
    answers: Dict[int, Any],  # question_id -> user_answer
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit all assessment answers at once and calculate scores"""
    # Users can only submit answers for themselves, superusers can submit for any user
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to submit answers for this user")
    
    try:
        result = await submit_multiple_answers(db, user_id, topic_id, answers)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/user/{user_id}/topic/{topic_id}", response_model=PostAssessmentRead)
async def update_post(
    user_id: int,
    topic_id: int,
    post_in: PostAssessmentUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a post assessment"""
    # Users can only update their own post_assessments, superusers can update any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post assessment")
    
    post_assessments = await list_for_user_topic(db, user_id=user_id, topic_id=topic_id)
    if not post_assessments:
        raise HTTPException(status_code=404, detail="PostAssessment not found")
    
    post_obj = post_assessments[0]  # Get the first (and should be only) post assessment
    updated = await update(db, post_obj, post_in)
    return updated

@router.get("/attempt-status/user/{user_id}/topic/{topic_id}")
async def get_attempt_status(
    user_id: int,
    topic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get attempt status for post assessment"""
    # Users can only view their own attempt status, superusers can view any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this attempt status")
    
    post_assessments = await list_for_user_topic(db, user_id=user_id, topic_id=topic_id)
    if not post_assessments:
        raise HTTPException(status_code=404, detail="PostAssessment not found")
    
    assessment = post_assessments[0]  # Get the first (and should be only) assessment
    
    return {
        "attempt_count": assessment.attempt_count,
        "total_items": assessment.total_items,
        "is_complete": assessment.total_items >= 15,
        "can_retry": assessment.attempt_count < 2 and assessment.total_items < 15,
        "max_attempts_reached": assessment.attempt_count >= 2,
        "can_take_second_attempt": assessment.attempt_count == 1 and assessment.total_items < 15
    }

@router.delete("/user/{user_id}/topic/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    user_id: int,
    topic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a post assessment"""
    # Users can only delete their own post_assessments, superusers can delete any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post assessment")
    
    post_assessments = await list_for_user_topic(db, user_id=user_id, topic_id=topic_id)
    if not post_assessments:
        raise HTTPException(status_code=404, detail="PostAssessment not found")
    
    post_obj = post_assessments[0]  # Get the first (and should be only) post assessment
    await delete(db, post_obj)

@router.patch("/user/{user_id}/topic/{topic_id}/reset", response_model=PostAssessmentRead)
async def reset_post_assessment_endpoint(
    user_id: int,
    topic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """
    Resets a post-assessment for a user and topic to its default state.
    Requires superuser privileges.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized to reset assessments")

    post_assessments = await list_for_user_topic(db, user_id=user_id, topic_id=topic_id)
    if not post_assessments:
        raise HTTPException(status_code=404, detail="PostAssessment not found")
    
    post_obj = post_assessments[0]
    updated = await reset_assessment(db, post_obj)
    return updated
