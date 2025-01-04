import os
import httpx
from app.db.database import db
from app.models.user import User

class UserService:
    @staticmethod
    async def create_user(user: User):
        # Directly store the profile data in your database
        async with (await db.get_pool()).acquire() as conn:
            query = """
                INSERT INTO users (id, first, last, connections, email, username, goal, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id, created_at, first, last, connections, email, username, goal
            """
            row = await conn.fetchrow(
                query,
                user.id,  # Use the ID provided by Supabase
                user.first,
                user.last,
                user.connections,
                user.email,
                user.username,
                user.goal,
                user.created_at,  # Use the timestamp provided by Supabase
            )
            return User(**dict(row))



    @staticmethod
    async def get_user_by_id(user_id: int):
        async with (await db.get_pool()).acquire() as conn:
            query = "SELECT * FROM users WHERE id = $1"
            row = await conn.fetchrow(query, user_id)
            if row:
                return User(**dict(row))
            return None

    @staticmethod
    async def get_all_users():
        async with (await db.get_pool()).acquire() as conn:
            query = "SELECT * FROM users"
            rows = await conn.fetch(query)
            return [User(**dict(row)) for row in rows]

    @staticmethod
    async def update_user(user_id: int, user_data: dict):
        async with (await db.get_pool()).acquire() as conn:
            fields = ", ".join(f"{key} = ${i+1}" for i, key in enumerate(user_data.keys()))
            query = f"UPDATE users SET {fields} WHERE id = ${len(user_data) + 1}"
            values = list(user_data.values()) + [user_id]
            await conn.execute(query, *values)

    @staticmethod
    async def delete_user(user_id: int):
        async with (await db.get_pool()).acquire() as conn:
            query = "DELETE FROM users WHERE id = $1"
            await conn.execute(query, user_id)
