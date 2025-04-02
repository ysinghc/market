from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_active_user, get_current_buyer_user, get_current_farmer_user
from app.models.models import Order, Crop, User
from app.schemas.schemas import Order as OrderSchema, OrderCreate, OrderUpdate

router = APIRouter()

@router.get("/", response_model=List[OrderSchema])
async def read_orders(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve orders. Users can only see their own orders.
    """
    if current_user.role == "admin":
        orders = db.query(Order).offset(skip).limit(limit).all()
    elif current_user.role == "farmer":
        orders = db.query(Order).join(Crop).filter(Crop.farmer_id == current_user.id).offset(skip).limit(limit).all()
    else:  # buyer
        orders = db.query(Order).filter(Order.buyer_id == current_user.id).offset(skip).limit(limit).all()
    return orders

@router.post("/", response_model=OrderSchema)
async def create_order(
    *,
    db: Session = Depends(get_db),
    order_in: OrderCreate,
    current_user: User = Depends(get_current_buyer_user),
) -> Any:
    """
    Create new order. Only buyers can create orders.
    """
    # Check if crop exists and is available
    crop = db.query(Crop).filter(Crop.id == order_in.crop_id).first()
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop not found"
        )
    if not crop.published_to_marketplace:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Crop is not available in marketplace"
        )
    if crop.quantity < order_in.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough quantity available"
        )
    
    # Create order
    order = Order(**order_in.model_dump(), buyer_id=current_user.id)
    db.add(order)
    db.commit()
    db.refresh(order)
    return order

@router.put("/{order_id}", response_model=OrderSchema)
async def update_order(
    *,
    db: Session = Depends(get_db),
    order_id: int,
    order_in: OrderUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Update an order. Only farmers can update orders for their crops.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user has permission to update the order
    if current_user.role == "farmer":
        if order.crop.farmer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    elif current_user.role == "buyer":
        if order.buyer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    
    # Update order status
    order.status = order_in.status
    
    # If order is accepted, update crop quantity
    if order_in.status == "accepted":
        crop = order.crop
        if crop.quantity < order.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not enough quantity available"
            )
        crop.quantity -= order.quantity
        db.add(crop)
    
    db.add(order)
    db.commit()
    db.refresh(order)
    return order

@router.get("/{order_id}", response_model=OrderSchema)
async def read_order(
    *,
    db: Session = Depends(get_db),
    order_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get order by ID. Users can only see their own orders.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if current_user.role == "farmer":
        if order.crop.farmer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    elif current_user.role == "buyer":
        if order.buyer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    
    return order 