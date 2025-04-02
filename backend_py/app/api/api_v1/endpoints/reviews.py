from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_active_user, get_current_buyer_user
from app.models.models import Review, Order, User
from app.schemas.schemas import Review as ReviewSchema, ReviewCreate, ReviewUpdate

router = APIRouter()

@router.get("/", response_model=List[ReviewSchema])
async def read_reviews(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve reviews. Users can only see reviews related to their orders.
    """
    if current_user.role == "admin":
        reviews = db.query(Review).offset(skip).limit(limit).all()
    elif current_user.role == "farmer":
        reviews = db.query(Review).filter(Review.farmer_id == current_user.id).offset(skip).limit(limit).all()
    else:  # buyer
        reviews = db.query(Review).filter(Review.buyer_id == current_user.id).offset(skip).limit(limit).all()
    return reviews

@router.post("/", response_model=ReviewSchema)
async def create_review(
    *,
    db: Session = Depends(get_db),
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_buyer_user),
) -> Any:
    """
    Create new review. Only buyers can create reviews.
    """
    # Check if order exists and belongs to the buyer
    order = db.query(Order).filter(Order.id == review_in.order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    if order.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    if order.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only review completed orders"
        )
    
    # Check if review already exists
    existing_review = db.query(Review).filter(Review.order_id == review_in.order_id).first()
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review already exists for this order"
        )
    
    # Create review
    review = Review(**review_in.model_dump(), buyer_id=current_user.id)
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

@router.put("/{review_id}", response_model=ReviewSchema)
async def update_review(
    *,
    db: Session = Depends(get_db),
    review_id: int,
    review_in: ReviewUpdate,
    current_user: User = Depends(get_current_buyer_user),
) -> Any:
    """
    Update a review. Only the buyer who created it can update it.
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    if review.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    for field, value in review_in.model_dump(exclude_unset=True).items():
        setattr(review, field, value)
    
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

@router.get("/{review_id}", response_model=ReviewSchema)
async def read_review(
    *,
    db: Session = Depends(get_db),
    review_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get review by ID. Users can only see reviews related to their orders.
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    if current_user.role == "farmer":
        if review.farmer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    elif current_user.role == "buyer":
        if review.buyer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    
    return review 