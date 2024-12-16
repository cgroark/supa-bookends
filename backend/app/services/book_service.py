from app.db.database import db
from app.models.book import Book, BookCreate
from typing import List

class BookService:
    @staticmethod
    async def create_book(book: BookCreate):
        async with (await db.get_pool()).acquire() as conn:
            query = """
                INSERT INTO books (title, author, overview, format, status, rating, start_date, end_date, comments)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id, title, author, overview, format, status, rating, start_date, end_date, comments
            """
            row = await conn.fetchrow(
                query,
                book.title,
                book.author,
                book.overview,
                book.format,
                book.status,
                book.rating,
                book.start_date,
                book.end_date,
                book.comments
            )
            return dict(row)

    @staticmethod
    async def get_books() -> List[Book]:
        query = "SELECT * FROM books"
        pool = await db.get_pool()
        rows = await pool.fetch(query)
        return [Book(**dict(row)) for row in rows]

    @staticmethod
    async def get_book_by_id(book_id: int) -> Book:
        query = "SELECT * FROM books WHERE id = $1"
        pool = await db.get_pool()
        row = await pool.fetchrow(query, book_id)
        if row:
            return Book(**dict(row))
        return None

    @staticmethod
    async def delete_book(book_id: int) -> None:
        query = "DELETE FROM books WHERE id = $1"
        pool = await db.get_pool()
        await pool.execute(query, book_id)
