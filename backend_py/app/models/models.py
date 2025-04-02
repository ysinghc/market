from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, Text, CheckConstraint, and_
from sqlalchemy.orm import relationship
from .base import BaseModel

class User(BaseModel):
    __tablename__ = "users"
    
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False)
    phone_number = Column(String(20))
    
    # Relationships
    crops = relationship("Crop", back_populates="farmer")
    orders_as_buyer = relationship("Order", back_populates="buyer", foreign_keys="Order.buyer_id")
    reviews_as_buyer = relationship("Review", back_populates="buyer", foreign_keys="[Review.buyer_id]")
    reviews_as_farmer = relationship("Review", back_populates="farmer", foreign_keys="[Review.farmer_id]")
    
    __table_args__ = (
        CheckConstraint(role.in_(['farmer', 'buyer', 'admin']), name='valid_role'),
    )

class Crop(BaseModel):
    __tablename__ = "crops"
    
    name = Column(String(100), nullable=False)
    description = Column(Text)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    category = Column(String(50), nullable=False)
    photo = Column(String(255))
    published_to_marketplace = Column(Boolean, default=False)
    farmer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    
    # Relationships
    farmer = relationship("User", back_populates="crops")
    orders = relationship("Order", back_populates="crop")

class Order(BaseModel):
    __tablename__ = "orders"
    
    quantity = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(String(20), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"))
    
    # Relationships
    buyer = relationship("User", back_populates="orders_as_buyer")
    crop = relationship("Crop", back_populates="orders")
    reviews = relationship("Review", back_populates="order")
    
    __table_args__ = (
        CheckConstraint(status.in_(['pending', 'accepted', 'rejected', 'completed']), name='valid_status'),
    )

class Review(BaseModel):
    __tablename__ = "reviews"
    
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    farmer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"))
    
    # Relationships
    buyer = relationship("User", back_populates="reviews_as_buyer", foreign_keys=[buyer_id])
    farmer = relationship("User", back_populates="reviews_as_farmer", foreign_keys=[farmer_id])
    order = relationship("Order", back_populates="reviews")
    
    __table_args__ = (
        CheckConstraint(and_(rating >= 1, rating <= 5), name='valid_rating'),
    ) 