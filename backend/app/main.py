from fastapi import FastAPI
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
from .routers import book_routes
from .routers import user_routes
from .routers import login_routes
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

app.include_router(book_routes.router)
app.include_router(user_routes.router)
app.include_router(login_routes.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Angular dev server
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers (Content-Type, Authorization, etc.)
)

@app.get("/")
async def root():
    return {"message": "Welcome to the backend API!"}
