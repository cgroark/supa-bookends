import os
import httpx
import json
from app.db.database import db
from uuid import UUID
from app.models.user import User

class UserService:
    @staticmethod
    async def create_user(user: User):
        # Directly store the profile data in your database
        async with (await db.get_pool()).acquire() as conn:
            query = """
                INSERT INTO users (id, first, last, connections, email, username, goals, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id, created_at, first, last, connections, email, username, goals
            """
            row = await conn.fetchrow(
                query,
                user.id,  # Use the ID provided by Supabase
                user.first,
                user.last,
                user.connections,
                user.email,
                user.username,
                user.goals,
                user.created_at,  # Use the timestamp provided by Supabase
            )
            return User(**dict(row))

    @staticmethod
    async def get_user_by_id(user_id: UUID):
        async with (await db.get_pool()).acquire() as conn:
            query = "SELECT * FROM users WHERE id = $1"
            result = await conn.fetchrow(query, user_id)
            if not result:
                raise HTTPException(status_code=404, detail="User not found")

            user_data = dict(result)
            # Deserialize JSON strings in goals to Python dictionaries
            if user_data.get("goals"):
                user_data["goals"] = [json.loads(goal) for goal in user_data["goals"]]

            return User(**user_data)  # Pass the deserialized data to the Pydantic model

    @staticmethod
    async def get_all_users():
        async with (await db.get_pool()).acquire() as conn:
            query = "SELECT * FROM users"
            rows = await conn.fetch(query)
            return [User(**dict(row)) for row in rows]

    @staticmethod
    async def search_users(query: str):
        async with (await db.get_pool()).acquire() as conn:
            query_str = """
            SELECT * FROM users
            WHERE first ILIKE $1 OR last ILIKE $1
            """
            rows = await conn.fetch(query_str, f"%{query}%")

            users = []
            for row in rows:
                user_data = dict(row)
                # Deserialize JSON strings in goals to Python dictionaries
                if user_data.get("goals"):
                    user_data["goals"] = [
                        json.loads(goal) for goal in user_data["goals"]
                    ]

                users.append(User(**user_data))  # Convert to Pydantic model

            return users



    # @staticmethod
    # async def update_user(user_id: int, user_data: dict):
    #     async with (await db.get_pool()).acquire() as conn:
    #         fields = ", ".join(f"{key} = ${i+1}" for i, key in enumerate(user_data.keys()))
    #         query = f"UPDATE users SET {fields} WHERE id = ${len(user_data) + 1}"
    #         values = list(user_data.values()) + [user_id]
    #         await conn.execute(query, *values)

    # @staticmethod
    # async def update_user(user_id: int, user_data: dict):
    #     async with (await db.get_pool()).acquire() as conn:
    #         # Ensure goals are converted to JSONB[]
    #         if "goals" in user_data:
    #             user_data["goals"] = [json.dumps(goal) for goal in user_data["goals"]]  # Flatten list of JSON strings

    #         fields = ", ".join(f"{key} = ${i+1}" for i, key in enumerate(user_data.keys()))
    #         query = f"UPDATE users SET {fields} WHERE id = ${len(user_data) + 1}"
    #         values = list(user_data.values()) + [user_id]
    #         print("Query:", query)
    #         print("Values:", values)

    #         await conn.execute(query, *values)

    @staticmethod
    async def update_user(user_id: int, user_data: dict):
        async with (await db.get_pool()).acquire() as conn:
            if "goals" in user_data:
                user_data["goals"] = [json.dumps(goal) for goal in user_data["goals"]]  # Convert list to JSON strings

            fields = ", ".join(f"{key} = ${i+1}" for i, key in enumerate(user_data.keys()))
            query = f"UPDATE users SET {fields} WHERE id = ${len(user_data) + 1}"
            values = list(user_data.values()) + [user_id]

            print("Query:", query)
            print("Values:", values)

            await conn.execute(query, *values)

    @staticmethod
    async def delete_user(user_id: int):
        async with (await db.get_pool()).acquire() as conn:
            query = "DELETE FROM users WHERE id = $1"
            await conn.execute(query, user_id)
