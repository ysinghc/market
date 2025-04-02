from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from .base import BaseSchema

# User schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = Field(..., pattern="^(farmer|buyer|admin)$")
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    password: Optional[str] = None

class User(UserBase, BaseSchema):
    pass

# Crop schemas
class CropBase(BaseModel):
    name: str
    description: Optional[str] = None
    quantity: float
    price: float
    unit: str
    category: str
    photo: Optional[str] = None
    published_to_marketplace: bool = False

class CropCreate(CropBase):
    farmer_id: int

class CropUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[float] = None
    price: Optional[float] = None
    unit: Optional[str] = None
    category: Optional[str] = None
    photo: Optional[str] = None
    published_to_marketplace: Optional[bool] = None

class Crop(CropBase, BaseSchema):
    farmer_id: int
    farmer: User

# Order schemas
class OrderBase(BaseModel):
    quantity: float
    total_price: float
    status: str = Field(..., pattern="^(pending|accepted|rejected|completed)$")
    buyer_id: int
    crop_id: int

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(pending|accepted|rejected|completed)$")

class Order(OrderBase, BaseSchema):
    buyer: User
    crop: Crop

# Review schemas
class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    buyer_id: int
    farmer_id: int
    order_id: int

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None

class Review(ReviewBase, BaseSchema):
    buyer: User
    farmer: User
    order: Order

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None 