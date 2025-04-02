from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import os
from pathlib import Path

from app.core.deps import get_db, get_current_active_user, get_current_farmer_user
from app.models.models import Crop, User
from app.schemas.schemas import Crop as CropSchema, CropCreate, CropUpdate

router = APIRouter()

@router.get("/", response_model=List[CropSchema])
async def read_crops(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve crops.
    """
    crops = db.query(Crop).filter(Crop.published_to_marketplace == True).offset(skip).limit(limit).all()
    return crops

@router.post("/", response_model=CropSchema)
async def create_crop(
    *,
    db: Session = Depends(get_db),
    crop_in: CropCreate,
    current_user: User = Depends(get_current_farmer_user),
) -> Any:
    """
    Create new crop. Only farmers can create crops.
    """
    crop = Crop(**crop_in.model_dump(), farmer_id=current_user.id)
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop

@router.put("/{crop_id}", response_model=CropSchema)
async def update_crop(
    *,
    db: Session = Depends(get_db),
    crop_id: int,
    crop_in: CropUpdate,
    current_user: User = Depends(get_current_farmer_user),
) -> Any:
    """
    Update a crop. Only the farmer who created it can update it.
    """
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop not found"
        )
    if crop.farmer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    for field, value in crop_in.model_dump(exclude_unset=True).items():
        setattr(crop, field, value)
    
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop

@router.get("/{crop_id}", response_model=CropSchema)
async def read_crop(
    *,
    db: Session = Depends(get_db),
    crop_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get crop by ID.
    """
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop not found"
        )
    return crop

@router.post("/{crop_id}/photo")
async def upload_crop_photo(
    *,
    db: Session = Depends(get_db),
    crop_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_farmer_user),
) -> Any:
    """
    Upload a photo for a crop. Only the farmer who created it can upload photos.
    """
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop not found"
        )
    if crop.farmer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    
    # Save the file
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"crop_{crop_id}{file_extension}"
    file_path = upload_dir / file_name
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Update crop photo path
    crop.photo = f"/uploads/{file_name}"
    db.add(crop)
    db.commit()
    
    return {"message": "Photo uploaded successfully", "photo_path": crop.photo} 