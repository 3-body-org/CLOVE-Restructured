# app/api/challenge_attempts.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.schemas.challenge_attempt import (
    ChallengeAttemptCreate,
    ChallengeAttemptRead,
    ChallengeAttemptResultRead,
    ChallengeAttemptRequest,
)
from app.schemas.challenge import ChallengeRead
from app.schemas.user_challenge import UserChallengeRead
from app.crud.challenge_attempt import create, get_by_user_id, get_attempt_count_by_user_and_subtopic, get_last_attempts_minimal_for_user_subtopic
from app.crud.user_subtopic import get_by_user_and_subtopic as get_user_subtopic_by_user_and_subtopic
from app.crud.user_challenge import (
    upsert as upsert_user_challenge,
    get_by_id as get_user_challenge_by_id,
    get_by_user_and_challenge
)
from app.services.selection import select_challenge
from app.db.session import get_db
from app.crud.challenge_attempt import delete_last_take_if_full
from app.api.auth import get_current_user, get_current_superuser
from app.db.models.users import User
from app.crud.challenge import get_by_id as get_challenge_by_id
from datetime import datetime, timedelta
import secrets

router = APIRouter(prefix="/challenge_attempts", tags=["ChallengeAttempts"])

# Create a response model that includes both challenge and user_challenge_id
class ChallengeSelectionResponse(BaseModel):
    challenge: ChallengeRead
    user_challenge_id: int
    user_challenge_status: str  # Add status to response

# Create a model for session validation request
class SessionValidationRequest(BaseModel):
    session_token: str

@router.get("/me", response_model=List[ChallengeAttemptRead])
async def get_my_challenge_attempts(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's challenge attempts"""
    return await get_by_user_id(db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/last-attempts/user/{user_id}/subtopic/{subtopic_id}", response_model=List[ChallengeAttemptResultRead])
async def get_last_attempts_for_user_subtopic_api(
    user_id: int,
    subtopic_id: int,
    limit: int = 5,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the last N challenge attempts for a user in a specific subtopic (minimal data for results page)"""
    # Users can only get their own attempts
    if user_id != current_user.id:
        raise HTTPException(403, "Not authorized to view this user's attempts")
    
    attempts = await get_last_attempts_minimal_for_user_subtopic(db, user_id, subtopic_id, limit)
    return attempts

@router.get("/count/user/{user_id}/subtopic/{subtopic_id}")
async def get_challenge_attempt_count(
    user_id: int,
    subtopic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get challenge attempt count for a user and subtopic"""
    # Users can only get their own attempt count
    if user_id != current_user.id:
        raise HTTPException(403, "Not authorized to view this user's attempt count")
    
    count = await get_attempt_count_by_user_and_subtopic(db, user_id, subtopic_id)
    return {"count": count}

@router.get("/select-challenge/user/{user_id}/subtopic/{subtopic_id}", response_model=ChallengeSelectionResponse)
async def get_next_challenge(
    user_id: int,
    subtopic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only select challenges for themselves
    if user_id != current_user.id:
        raise HTTPException(403, "Not authorized to select challenges for this user")

    # Get user_subtopic by user_id and subtopic_id
    user_subtopic = await get_user_subtopic_by_user_and_subtopic(db, user_id, subtopic_id)
    if not user_subtopic:
        raise HTTPException(404, "User subtopic not found")

    # ❗️Delete all 5 attempts if we've just completed a take
    await delete_last_take_if_full(
        db,
        user_id=user_id,
        subtopic_id=subtopic_id,
        take_size=5
    )
        
    try:
        # Get the selected challenge
        challenge = await select_challenge(
            db=db,
            user_subtopic_id=user_subtopic.id,
            knowledge=user_subtopic.knowledge_level
        )

        # Check if there's an existing cancelled user_challenge for this challenge
        existing_uc = await get_by_user_and_challenge(
            db,
            user_id=user_id,
            challenge_id=challenge.id
        )

        if existing_uc and existing_uc.status == "cancelled":
            # Reuse the cancelled user_challenge but keep it cancelled for read-only mode
            user_challenge = existing_uc  # Don't change the status, keep it cancelled
        else:
            # Create a new user_challenge only if no cancelled one exists
            user_challenge = await upsert_user_challenge(
                db,
                user_id=user_id,
                challenge_id=challenge.id,
                is_solved=False,
                status="pending"
            )

        return {
            "challenge": challenge,
            "user_challenge_id": user_challenge.id,
            "user_challenge_status": user_challenge.status
        }
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/activate-session/user/{user_id}/challenge/{challenge_id}", status_code=200)
async def activate_challenge_session(
    user_id: int,
    challenge_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Activate a challenge session when user starts the challenge"""
    # Users can only activate sessions for themselves
    if user_id != current_user.id:
        raise HTTPException(403, "Not authorized to activate session for this user")
    
    # First, get the challenge to find its subtopic
    challenge = await get_challenge_by_id(db, challenge_id)
    if not challenge:
        raise HTTPException(404, "Challenge not found")
    
    # Check for existing active sessions in OTHER subtopics (not the current one)
    from app.crud.user_challenge import get_active_sessions_by_user_and_subtopic, get_all_active_sessions_by_user
    all_active_sessions = await get_all_active_sessions_by_user(db, user_id=user_id)
    
    # Filter out sessions from the current subtopic (allow multiple in same subtopic)
    other_subtopic_sessions = [
        session for session in all_active_sessions 
        if session.challenge.subtopic_id != challenge.subtopic_id
    ]
    
    if other_subtopic_sessions:
        # Show warning about existing sessions in other subtopics
        return {
            "success": False,
            "message": f"You are currently answering challenges in another subtopic. You must finish or close that tab first.",
            "existing_sessions": [
                {
                    "challenge_id": session.challenge_id,
                    "subtopic_id": session.challenge.subtopic_id,
                    "subtopic_name": session.challenge.subtopic.name if hasattr(session.challenge, 'subtopic') else "Unknown",
                    "started_at": session.session_started_at
                }
                for session in other_subtopic_sessions
            ],
            "requires_user_action": True
        }
    
    # Check for existing active sessions in the SAME subtopic
    same_subtopic_sessions = await get_active_sessions_by_user_and_subtopic(
        db, 
        user_id=user_id, 
        subtopic_id=challenge.subtopic_id
    )
    
    if same_subtopic_sessions:
        # User already has an active session in this subtopic
        return {
            "success": False,
            "message": "Another challenge is already active in this subtopic",
            "existing_session": {
                "challenge_id": same_subtopic_sessions[0].challenge_id,
                "started_at": same_subtopic_sessions[0].session_started_at
            }
        }
    
    # Get the user_challenge record
    user_challenge = await get_by_user_and_challenge(db, user_id, challenge_id)
    if not user_challenge:
        raise HTTPException(404, "User challenge not found")
    
    # Generate session token
    session_token = f"ch_sess_{secrets.token_urlsafe(32)}"
    
    # Set session start time (NO EXPIRATION - sessions last until manually deactivated)
    session_started_at = datetime.utcnow()
    
    # Determine the status to set based on current status
    # For cancelled challenges, keep the "cancelled" status (don't change to "active")
    # For other challenges, set to "active"
    new_status = "active" if user_challenge.status != "cancelled" else "cancelled"
    
    # For session activation, we don't need to calculate timer/hints flags
    # They will be set when the user submits their attempt
    timer_enabled = None
    hints_enabled = None
    
    # Update user_challenge with session data and timer/hints flags
    await upsert_user_challenge(
        db,
        user_id=user_id,
        challenge_id=challenge_id,
        is_solved=user_challenge.is_solved,
        status=new_status,  # Keep "cancelled" if it was cancelled, otherwise "active"
        session_token=session_token,
        session_started_at=session_started_at,
        last_activity_at=session_started_at,
        timer_enabled=timer_enabled,
        hints_enabled=hints_enabled
    )
    
    return {
        "success": True,
        "message": "Challenge session activated",
        "session_token": session_token,
        "expires_at": None,  # NO EXPIRATION
        "auto_deactivated_sessions": len(other_subtopic_sessions) if other_subtopic_sessions else 0
    }

@router.post("/validate-session/user/{user_id}/challenge/{challenge_id}", status_code=200)
async def validate_challenge_session(
    user_id: int,
    challenge_id: int,
    session_request: SessionValidationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Validate an active challenge session"""
    # Users can only validate their own sessions
    if user_id != current_user.id:
        raise HTTPException(403, "Not authorized to validate session for this user")
    
    # Get the user_challenge record
    user_challenge = await get_by_user_and_challenge(db, user_id, challenge_id)
    if not user_challenge:
        return {"valid": False, "message": "User challenge not found"}
    
    # Check if session is active and valid
    if user_challenge.status != "active":
        return {"valid": False, "message": "Challenge session is not active"}
    
    if user_challenge.session_token != session_request.session_token:
        return {"valid": False, "message": "Invalid session token"}
    
    # NO EXPIRATION CHECK - sessions last until manually deactivated
    
    # Update last activity
    await upsert_user_challenge(
        db,
        user_id=user_id,
        challenge_id=challenge_id,
        is_solved=user_challenge.is_solved,
        status="active",
        session_token=user_challenge.session_token,
        session_started_at=user_challenge.session_started_at,
        last_activity_at=datetime.utcnow()
    )
    
    return {"valid": True, "message": "Session is valid"}

@router.post("/deactivate-session/user/{user_id}/challenge/{challenge_id}", status_code=200)
async def deactivate_challenge_session(
    user_id: int,
    challenge_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deactivate a challenge session"""
    # Users can only deactivate their own sessions
    if user_id != current_user.id:
        raise HTTPException(403, "Not authorized to deactivate session for this user")
    
    # Get the user_challenge record
    user_challenge = await get_by_user_and_challenge(db, user_id, challenge_id)
    if not user_challenge:
        raise HTTPException(404, "User challenge not found")
    
    # Clear session data but preserve completed status
    # If the challenge was already completed, keep it completed
    # If it was active/pending, set it back to pending
    new_status = "pending" if user_challenge.status != "completed" else "completed"
    
    await upsert_user_challenge(
        db,
        user_id=user_id,
        challenge_id=challenge_id,
        is_solved=user_challenge.is_solved,
        status=new_status,
        session_token=None,
        session_started_at=None,
        last_activity_at=None
    )
    
    return {"message": "Challenge session deactivated"}

@router.post("/force-deactivate-all-sessions/user/{user_id}", status_code=200)
async def force_deactivate_all_sessions(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Force deactivate all active sessions for a user (when they choose to close other tabs)"""
    # Users can only deactivate their own sessions
    if user_id != current_user.id:
        raise HTTPException(403, "Not authorized to deactivate sessions for this user")
    
    # Get all active sessions for the user
    from app.crud.user_challenge import get_all_active_sessions_by_user
    all_active_sessions = await get_all_active_sessions_by_user(db, user_id=user_id)
    
    if not all_active_sessions:
        return {"message": "No active sessions found", "deactivated_count": 0}
    
    # Deactivate all sessions
    deactivated_count = 0
    for session in all_active_sessions:
        await upsert_user_challenge(
            db,
            user_id=user_id,
            challenge_id=session.challenge_id,
            is_solved=session.is_solved,
            status="cancelled",  # Mark as cancelled since user chose to close
            session_token=None,
            session_started_at=None,
            last_activity_at=None
        )
        deactivated_count += 1
    
    return {
        "message": f"Deactivated {deactivated_count} active session(s)",
        "deactivated_count": deactivated_count
    }

@router.post("/", response_model=ChallengeAttemptRead, status_code=status.HTTP_201_CREATED)
async def create_attempt(
    attempt_in: ChallengeAttemptRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Validate FK: user_challenge
    user_challenge = await get_user_challenge_by_id(db, attempt_in.user_challenge_id)
    if not user_challenge:
        raise HTTPException(404, "User challenge not found")

    # Users can only create attempts for their own user_challenges
    if user_challenge.user_id != current_user.id:
        raise HTTPException(403, "Not authorized to create attempts for this user challenge")

    # 2. Get the challenge to validate the answer
    challenge = await get_challenge_by_id(db, user_challenge.challenge_id)
    if not challenge:
        raise HTTPException(404, "Challenge not found")

    # 3. Validate the user's answer and determine actual success
    # For cancelled challenges or empty answers, always mark as unsuccessful
    if user_challenge.status == "cancelled" or not attempt_in.user_answer or attempt_in.user_answer.strip() == "":
        actual_is_successful = False
        actual_points = 0
    else:
        # Use the frontend's validation result (which now includes proper validation)
        # The frontend validates the answer based on challenge mode and data
        actual_is_successful = attempt_in.is_successful
        # Safety check: only award points if the challenge is actually successful
        actual_points = attempt_in.points if actual_is_successful else 0
        
        # Log the validation result for debugging
        print(f"Challenge validation: user_id={current_user.id}, challenge_id={challenge.id}, is_successful={actual_is_successful}, points={actual_points}")

    # 4. Create the attempt with validated data
    validated_attempt_data = ChallengeAttemptCreate(
        user_challenge_id=attempt_in.user_challenge_id,
        user_answer=attempt_in.user_answer,
        is_successful=actual_is_successful,
        time_spent=attempt_in.time_spent,
        hints_used=attempt_in.hints_used,
        points=actual_points
    )
    
    attempt = await create(db, validated_attempt_data)

    # 5. Use timer/hints flags from frontend (much simpler!)
    timer_enabled = attempt_in.timer_enabled
    hints_enabled = attempt_in.hints_enabled
    
    # 6. Upsert user_challenges with timer/hints flags from frontend
    print(f"About to upsert user_challenge: user_id={user_challenge.user_id}, challenge_id={user_challenge.challenge_id}, is_successful={actual_is_successful}, status=completed, timer_enabled={timer_enabled}, hints_enabled={hints_enabled}")
    await upsert_user_challenge(
        db,
        user_id=user_challenge.user_id,
        challenge_id=user_challenge.challenge_id,
        is_solved=actual_is_successful,
        status="completed",
        timer_enabled=timer_enabled,
        hints_enabled=hints_enabled
    )
    print(f"Upsert completed for user_challenge: user_id={user_challenge.user_id}, challenge_id={user_challenge.challenge_id}")

    return attempt

# Create a model for cancel request
class CancelChallengeRequest(BaseModel):
    time_spent: int = 0
    hints_used: int = 0
    partial_answer: str | None = None
    timer_enabled: bool | None = None
    hints_enabled: bool | None = None

@router.post("/cancel/user/{user_id}/challenge/{challenge_id}", status_code=200)
async def cancel_challenge(
    user_id: int,
    challenge_id: int,
    cancel_data: CancelChallengeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only cancel their own challenges
    if user_id != current_user.id:
        raise HTTPException(403, "Not authorized to cancel this challenge")
    
    uc = await get_by_user_and_challenge(db, user_id, challenge_id)
    if not uc:
        raise HTTPException(404, "Not found")
    
    # Use timer/hints flags from frontend (much simpler!)
    timer_enabled = cancel_data.timer_enabled
    hints_enabled = cancel_data.hints_enabled
    
    await upsert_user_challenge(
        db,
        user_id=uc.user_id,
        challenge_id=uc.challenge_id,
        is_solved=uc.is_solved,
        status="cancelled",
        time_spent=cancel_data.time_spent,
        hints_used=cancel_data.hints_used,
        partial_answer=cancel_data.partial_answer,
        timer_enabled=timer_enabled,
        hints_enabled=hints_enabled,
        was_cancelled=True
    )
    return {"message": "Marked cancelled"}

@router.delete("/user/{user_id}/subtopic/{subtopic_id}", status_code=200)
async def delete_all_challenge_attempts_for_subtopic(
    user_id: int,
    subtopic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete all challenge attempts for a user in a specific subtopic"""
    # Users can only delete their own challenge attempts
    if user_id != current_user.id:
        raise HTTPException(403, "Not authorized to delete challenge attempts for this user")
    
    # Import the delete function from challenge_attempt CRUD
    from app.crud.challenge_attempt import delete_by_user_and_subtopic
    
    try:
        deleted_count = await delete_by_user_and_subtopic(db, user_id, subtopic_id)
        return {
            "message": f"Successfully deleted {deleted_count} challenge attempts",
            "deleted_count": deleted_count,
            "user_id": user_id,
            "subtopic_id": subtopic_id
        }
    except Exception as e:
        raise HTTPException(500, f"Error deleting challenge attempts: {str(e)}")
