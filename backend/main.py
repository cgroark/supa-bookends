from fastapi import FastAPI
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = "https://yrvpfjwryrkdbsuqoisn.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlydnBmandyeXJrZGJzdXFvaXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxOTIyOTAsImV4cCI6MjA0OTc2ODI5MH0.T4eMLzdxTErZLahYivvEM9tT7ulwgdDbVTZPjtVdX5s"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or use ["http://localhost:4200"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the backend API!"}

@app.get("/items")
async def get_items():
    """Fetch all rows from a 'items' table."""
    response = supabase.table('items').select("*").execute()
    return response.data

@app.post("/add-item")
async def add_item(item: dict):
    """Add a new item to the 'items' table."""
    response = supabase.table('items').insert(item).execute()
    return response.data
