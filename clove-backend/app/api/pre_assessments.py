# app/api/pre_assessments.py
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession 
from app.schemas.pre_assessment import PreAssessmentRead, PreAssessmentCreate, PreAssessmentUpdate, SingleAnswerSubmission
from app.crud.pre_assessment import (
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

router = APIRouter(prefix="/pre_assessments", tags=["PreAssessments"])

@router.post("/", response_model=PreAssessmentRead, status_code=status.HTTP_201_CREATED)
async def create_pre(
    pre_in: PreAssessmentCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new pre assessment"""
    created = await create(db, pre_in)
    return created

@router.get("/user/{user_id}/topic/{topic_id}", response_model=PreAssessmentRead)
async def read_pre(
    user_id: int,
    topic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific pre assessment by user and topic"""
    # Users can only view their own pre_assessments, superusers can view any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this pre assessment")
    
    pre_assessments = await list_for_user_topic(db, user_id=user_id, topic_id=topic_id)
    if not pre_assessments:
        raise HTTPException(status_code=404, detail="PreAssessment not found")
    
    # Return the first (and should be only) pre assessment for this user-topic pair
    return pre_assessments[0]

@router.get("/", response_model=List[PreAssessmentRead])
async def list_pres(
    user_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all pre assessments for a specific user across all topics"""
    if user_id is None:
        raise HTTPException(status_code=400, detail="user_id query parameter is required")
    
    # Users can only view their own pre_assessments, superusers can view any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this user's pre assessments")
    
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

@router.post("/submit-answers", response_model=PreAssessmentRead)
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

@router.patch("/user/{user_id}/topic/{topic_id}", response_model=PreAssessmentRead)
async def update_pre(
    user_id: int,
    topic_id: int,
    pre_in: PreAssessmentUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a pre assessment"""
    # Users can only update their own pre_assessments, superusers can update any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this pre assessment")
    
    pre_assessments = await list_for_user_topic(db, user_id=user_id, topic_id=topic_id)
    if not pre_assessments:
        raise HTTPException(status_code=404, detail="PreAssessment not found")
    
    pre_obj = pre_assessments[0]  # Get the first (and should be only) pre assessment
    updated = await update(db, pre_obj, pre_in)
    return updated

@router.get("/attempt-status/user/{user_id}/topic/{topic_id}")
async def get_attempt_status(
    user_id: int,
    topic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get attempt status for pre assessment"""
    # Users can only view their own attempt status, superusers can view any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this attempt status")
    
    pre_assessments = await list_for_user_topic(db, user_id=user_id, topic_id=topic_id)
    if not pre_assessments:
        raise HTTPException(status_code=404, detail="PreAssessment not found")
    
    assessment = pre_assessments[0]  # Get the first (and should be only) assessment
    
    return {
        "attempt_count": assessment.attempt_count,
        "total_items": assessment.total_items,
        "is_complete": assessment.total_items >= 15,
        "can_retry": assessment.attempt_count < 2 and assessment.total_items < 15,
        "max_attempts_reached": assessment.attempt_count >= 2,
        "can_take_second_attempt": assessment.attempt_count == 1 and assessment.total_items < 15
    }

@router.delete("/user/{user_id}/topic/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pre(
    user_id: int,
    topic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a pre assessment"""
    # Users can only delete their own pre_assessments, superusers can delete any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this pre assessment")
    
    pre_assessments = await list_for_user_topic(db, user_id=user_id, topic_id=topic_id)
    if not pre_assessments:
        raise HTTPException(status_code=404, detail="PreAssessment not found")
    
    post_obj = pre_assessments[0]  # Get the first (and should be only) pre assessment
    await delete(db, post_obj)

@router.patch("/user/{user_id}/topic/{topic_id}/reset", response_model=PreAssessmentRead)
async def reset_pre_assessment_endpoint(
    user_id: int,
    topic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """
    Resets a pre-assessment for a user and topic to its default state.
    Requires superuser privileges.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized to reset assessments")
        
    pre_assessments = await list_for_user_topic(db, user_id=user_id, topic_id=topic_id)
    if not pre_assessments:
        raise HTTPException(status_code=404, detail="PreAssessment not found")
    
    pre_obj = pre_assessments[0]
    updated = await reset_assessment(db, pre_obj)
    return updated
