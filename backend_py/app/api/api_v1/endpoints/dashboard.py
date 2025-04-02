from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.core.deps import get_db, get_current_active_user
from app.models.models import User, Crop, Order, Review

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Get dashboard statistics. Different stats based on user role.
    """
    if current_user.role == "admin":
        return {
            "total_users": db.query(func.count(User.id)).scalar(),
            "total_farmers": db.query(func.count(User.id)).filter(User.role == "farmer").scalar(),
            "total_buyers": db.query(func.count(User.id)).filter(User.role == "buyer").scalar(),
            "total_crops": db.query(func.count(Crop.id)).scalar(),
            "total_orders": db.query(func.count(Order.id)).scalar(),
            "total_reviews": db.query(func.count(Review.id)).scalar(),
            "recent_orders": db.query(Order).order_by(Order.created_at.desc()).limit(5).all(),
            "recent_reviews": db.query(Review).order_by(Review.created_at.desc()).limit(5).all(),
        }
    elif current_user.role == "farmer":
        return {
            "total_crops": db.query(func.count(Crop.id)).filter(Crop.farmer_id == current_user.id).scalar(),
            "total_orders": db.query(func.count(Order.id)).join(Crop).filter(Crop.farmer_id == current_user.id).scalar(),
            "total_reviews": db.query(func.count(Review.id)).filter(Review.farmer_id == current_user.id).scalar(),
            "recent_orders": db.query(Order).join(Crop).filter(Crop.farmer_id == current_user.id).order_by(Order.created_at.desc()).limit(5).all(),
            "recent_reviews": db.query(Review).filter(Review.farmer_id == current_user.id).order_by(Review.created_at.desc()).limit(5).all(),
        }
    else:  # buyer
        return {
            "total_orders": db.query(func.count(Order.id)).filter(Order.buyer_id == current_user.id).scalar(),
            "total_reviews": db.query(func.count(Review.id)).filter(Review.buyer_id == current_user.id).scalar(),
            "recent_orders": db.query(Order).filter(Order.buyer_id == current_user.id).order_by(Order.created_at.desc()).limit(5).all(),
            "recent_reviews": db.query(Review).filter(Review.buyer_id == current_user.id).order_by(Review.created_at.desc()).limit(5).all(),
        }

@router.get("/analytics")
async def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """
    Get dashboard analytics. Different analytics based on user role.
    """
    if current_user.role == "admin":
        return {
            "orders_by_status": db.query(
                Order.status, func.count(Order.id)
            ).group_by(Order.status).all(),
            "average_rating": db.query(func.avg(Review.rating)).scalar(),
            "total_revenue": db.query(func.sum(Order.total_price)).scalar(),
            "crops_by_category": db.query(
                Crop.category, func.count(Crop.id)
            ).group_by(Crop.category).all(),
        }
    elif current_user.role == "farmer":
        return {
            "orders_by_status": db.query(
                Order.status, func.count(Order.id)
            ).join(Crop).filter(Crop.farmer_id == current_user.id).group_by(Order.status).all(),
            "average_rating": db.query(func.avg(Review.rating)).filter(Review.farmer_id == current_user.id).scalar(),
            "total_revenue": db.query(func.sum(Order.total_price)).join(Crop).filter(Crop.farmer_id == current_user.id).scalar(),
            "crops_by_category": db.query(
                Crop.category, func.count(Crop.id)
            ).filter(Crop.farmer_id == current_user.id).group_by(Crop.category).all(),
        }
    else:  # buyer
        return {
            "orders_by_status": db.query(
                Order.status, func.count(Order.id)
            ).filter(Order.buyer_id == current_user.id).group_by(Order.status).all(),
            "average_rating": db.query(func.avg(Review.rating)).filter(Review.buyer_id == current_user.id).scalar(),
            "total_spent": db.query(func.sum(Order.total_price)).filter(Order.buyer_id == current_user.id).scalar(),
        } 