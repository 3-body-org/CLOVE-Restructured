# app/api/user_topics.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user_topic import UserTopicRead, UserTopicCreate, UserTopicUpdate
from app.crud.user_topic import get_by_id, get_by_user_and_topic, list_for_user, create, update, delete
from app.db.session import get_db
from app.api.auth import get_current_user, get_current_superuser
from app.db.models.users import User
from app.crud.user_subtopic import list_for_user as list_user_subtopics
from app.schemas.user_subtopic import UserSubtopicRead
from app.crud.pre_assessment import list_for_user_topic as get_pre_assessment_for_user_topic
from app.crud.user_subtopic import list_for_user as get_user_subtopics
from app.crud.post_assessment import list_for_user_topic as get_post_assessment_for_user_topic
from app.schemas.pre_assessment import PreAssessmentRead
from app.schemas.post_assessment import PostAssessmentRead

router = APIRouter(prefix="/user_topics", tags=["UserTopics"])

@router.post("/", response_model=UserTopicRead, status_code=status.HTTP_201_CREATED)
async def create_user_topic(
    user_topic_in: UserTopicCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user_topic already exists
    existing = await get_by_user_and_topic(db, user_topic_in.user_id, user_topic_in.topic_id)
    if existing:
        raise HTTPException(status_code=400, detail="User topic already exists")
    created = await create(db, user_topic_in)
    return created

@router.get("/user/{user_id}/topic/{topic_id}", response_model=UserTopicRead)
async def read_user_topic(
    user_id: int,
    topic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only view their own user_topics, superusers can view any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this user topic")
    
    user_topic = await get_by_user_and_topic(db, user_id, topic_id)
    if not user_topic:
        raise HTTPException(status_code=404, detail="User topic not found")
    
    return user_topic

@router.get("/user/{user_id}", response_model=List[UserTopicRead])
async def list_user_topics(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only view their own user_topics, superusers can view any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this user's topics")
    
    user_topics = await list_for_user(db, user_id=user_id, skip=skip, limit=limit)
    # For each topic, fetch subtopics for this user and topic
    all_user_subtopics = await list_user_subtopics(db, user_id=user_id)
    for ut in user_topics:
        ut.subtopics = sorted(
            [
                UserSubtopicRead.model_validate(st)
                for st in all_user_subtopics
                if st.subtopic.topic_id == ut.topic_id
            ],
            key=lambda st: st.subtopic.subtopic_id
        )
    return user_topics

@router.get("/user/{user_id}/topic/{topic_id}/overview", response_model=dict)
async def get_topic_overview(
    user_id: int,
    topic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only view their own data
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this overview")

    # Fetch user_topic to get the unlock status
    user_topic = await get_by_user_and_topic(db, user_id, topic_id)
    
    # Fetch pre-assessment (should be one per user/topic)
    pre_assessments = await get_pre_assessment_for_user_topic(db, user_id, topic_id)
    pre_assessment = pre_assessments[0] if pre_assessments else None
    # Fetch all user subtopics for this user, filter by topic and sort by subtopic_id
    all_user_subtopics = await get_user_subtopics(db, user_id)
    subtopics = sorted(
        [s for s in all_user_subtopics if s.subtopic.topic_id == topic_id],
        key=lambda s: s.subtopic.subtopic_id
    )
    # Fetch post-assessment (should be one per user/topic)
    post_assessments = await get_post_assessment_for_user_topic(db, user_id, topic_id)
    post_assessment = post_assessments[0] if post_assessments else None
    return {
        "pre_assessment": PreAssessmentRead.model_validate(pre_assessment).model_dump() if pre_assessment else None,
        "subtopics": [UserSubtopicRead.model_validate(s).model_dump() for s in subtopics],
        "post_assessment": PostAssessmentRead.model_validate(post_assessment).model_dump() if post_assessment else None,
        "is_unlocked": user_topic.is_unlocked if user_topic else False
    }

@router.patch("/user/{user_id}/topic/{topic_id}", response_model=UserTopicRead)
async def update_user_topic(
    user_id: int,
    topic_id: int,
    user_topic_in: UserTopicUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only update their own user_topics, superusers can update any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user topic")
    
    user_topic = await get_by_user_and_topic(db, user_id, topic_id)
    if not user_topic:
        raise HTTPException(status_code=404, detail="User topic not found")
    
    updated = await update(db, user_topic, user_topic_in)
    return updated

@router.delete("/user/{user_id}/topic/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_topic(
    user_id: int,
    topic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only delete their own user_topics, superusers can delete any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this user topic")
    
    user_topic = await get_by_user_and_topic(db, user_id, topic_id)
    if not user_topic:
        raise HTTPException(status_code=404, detail="User topic not found")
    
    await delete(db, user_topic)
    return 
