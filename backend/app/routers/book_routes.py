from fastapi import APIRouter, Depends, HTTPException, Query
from app.utils.auth import validate_token

from app.models.book import Book, BookCreate
from app.services.book_service import BookService

router = APIRouter(prefix="/books", tags=["Books"])


@router.post("/", response_model=Book)
async def create_book(book: BookCreate):
    new_book = await BookService.create_book(book)
    return new_book

@router.patch("/{book_id}", response_model=Book)
async def update_book(book_id: int, book: BookCreate):
    updated_book = await BookService.update_book(book_id, book)
    if not updated_book:
        raise HTTPException(status_code=404, detail="Book not found")
    return updated_book

@router.get("/", response_model=list[Book])
async def get_books(user_id: str = Query(..., description="ID of the user to fetch books for")):
    books = await BookService.get_books_by_user_id(user_id)
    return books

@router.get("/{book_id}", response_model=Book)
async def get_book(book_id: int):
    book = await BookService.get_book_by_id(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@router.delete("/{book_id}")
async def delete_book(book_id: int):
    await BookService.delete_book(book_id)
    return {"message": "Book deleted successfully"}
