from pydantic import BaseModel
from typing import Optional
from datetime import date

class BookCreate(BaseModel):
    title: str
    author: str
    overview: Optional[str] = None
    format: Optional[int] = None
    status: Optional[int] = None
    rating: Optional[int] = None
    end_date: Optional[date] = None
    comments: Optional[str] = None
    image_url: Optional[str] = None
    user_id: Optional[str] = None

class Book(BookCreate):
    id: int