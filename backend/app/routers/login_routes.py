from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import os

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login_user(login: LoginRequest):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{os.getenv('SUPABASE_URL')}/auth/v1/token",
            headers={"apikey": os.getenv("SUPABASE_KEY")},
            json={"email": login.email, "password": login.password},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid login credentials")
        return response.json()
