from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.crud.user import update_user
from app.api.auth import get_current_user
from app.db.models.users import User
from typing import Dict, Any

router = APIRouter(prefix="/api/users", tags=["onboarding"])

@router.put("/onboarding")
async def complete_onboarding(
    onboarding_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Complete user onboarding with character and realm selection data
    """
    try:
        # Prepare update data
        update_data = {
            "onboarding_completed": True,
            "username": onboarding_data.get("traveler_name"),  # Use traveler_name as new username
            "traveler_class": onboarding_data.get("traveler_class"),
            "selected_realm": onboarding_data.get("selected_realm"),
            "current_realm": onboarding_data.get("selected_realm", "wizard-academy"),
            "story_progress": onboarding_data.get("story_progress", {})
        }
        
        # Update user in database
        updated_user = await update_user(db, current_user, update_data)
        
        return {
            "message": "Onboarding completed successfully",
            "user": {
                "id": updated_user.id,
                "username": updated_user.username,
                "email": updated_user.email,
                "onboarding_completed": updated_user.onboarding_completed,
                "traveler_class": updated_user.traveler_class,
                "selected_realm": updated_user.selected_realm,
                "current_realm": updated_user.current_realm,
                "story_progress": updated_user.story_progress
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete onboarding: {str(e)}"
        )

@router.get("/onboarding/status")
async def get_onboarding_status(
    current_user: User = Depends(get_current_user)
):
    """
    Get user's onboarding status
    """
    return {
        "onboarding_completed": current_user.onboarding_completed,
        "traveler_class": current_user.traveler_class,
        "selected_realm": current_user.selected_realm,
        "current_realm": current_user.current_realm,
        "story_progress": current_user.story_progress
    }

@router.put("/realm/switch")
async def switch_realm(
    realm_data: Dict[str, str],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Switch user's current realm
    """
    try:
        new_realm = realm_data.get("realm")
        
        if new_realm not in ["wizard-academy", "detective-agency", "space-station"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid realm. Must be one of: wizard-academy, detective-agency, space-station"
            )
        
        # Update user's current realm
        updated_user = await update_user(db, current_user, {"current_realm": new_realm})
        
        return {
            "message": f"Successfully switched to {new_realm}",
            "current_realm": updated_user.current_realm
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to switch realm: {str(e)}"
        )
