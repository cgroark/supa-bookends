from app.db.database import db
from app.models.book import Book, BookCreate
from typing import List

class BookService:
    @staticmethod
    async def create_book(book: BookCreate):
        async with (await db.get_pool()).acquire() as conn:
            # end_date = datetime.strptime(book.end_date, "%m-%d-%Y").date() if isinstance(book.end_date, str) else book.end_date
            end_date = None
            if book.end_date and isinstance(book.end_date, str):
                try:
                    end_date = datetime.strptime(book.end_date, "%Y-%m-%d").date()
                except ValueError as e:
                    raise ValueError(f"Invalid date format for end_date: {book.end_date}") from e
            query = """
                INSERT INTO books (title, author, overview, format, status, rating, end_date, comments, image_url, user_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id, title, author, overview, format, status, rating, end_date, comments, image_url, user_id
            """
            row = await conn.fetchrow(
                query,
                book.title,
                book.author,
                book.overview,
                book.format,
                book.status,
                book.rating,
                book.end_date,
                book.comments,
                book.image_url,
                book.user_id,
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
