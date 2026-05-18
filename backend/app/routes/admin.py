from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import models
from app.schemas import schemas
from app.routes.auth import get_current_user

router = APIRouter()

# Dependency to check if current user is an admin
def get_current_admin(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have enough privileges",
        )
    return current_user

@router.get("/users", response_model=list[schemas.UserResponse])
def get_all_users(
    skip: int = 0, limit: int = 100, 
    db: Session = Depends(get_db), 
    current_admin: models.User = Depends(get_current_admin)
):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int, 
    db: Session = Depends(get_db), 
    current_admin: models.User = Depends(get_current_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Optional: Prevent admin from deleting themselves
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
    db.delete(user)
    db.commit()
    return None

@router.put("/users/{user_id}/role", response_model=schemas.UserResponse)
def update_user_role(
    user_id: int, 
    is_admin: bool,
    db: Session = Depends(get_db), 
    current_admin: models.User = Depends(get_current_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Optional: Prevent admin from demoting themselves to avoid locking everyone out
    if user.id == current_admin.id and not is_admin:
        raise HTTPException(status_code=400, detail="Cannot demote yourself")
        
    user.is_admin = is_admin
    db.commit()
    db.refresh(user)
    return user
