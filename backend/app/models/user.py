from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID  # Import UUID

class UserBase(BaseModel):
    first: str
    last: str
    connections: Optional[List[str]] = []
    username: str
    email: Optional[str] = None
    goal: Optional[int] = None

class User(UserBase):
    id: UUID
    created_at: datetime
    password: Optional[str] = None


    class Config:
        orm_mode = True
        exclude = {"password"}

