from app.db.database import db
from app.models.user import User, UserCreate

class UserService:
    @staticmethod
    async def create_user(user: UserCreate):
        async with (await db.get_pool()).acquire() as conn:
            query = """
                INSERT INTO users (first, last, connections, goal, username, password)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, created_at, first, last, connections, goal, username
            """
            row = await conn.fetchrow(
                query,
                user.first,
                user.last,
                user.connections,
                user.goal,
                user.username,
                user.password,  # Ensure hashing in a real app
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
