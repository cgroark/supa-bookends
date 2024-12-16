import asyncpg
import os
from app.config import DATABASE_URL

class Database:
    def __init__(self, db_url: str):
        self.db_url = db_url
        self.pool = None

    async def connect(self):
        if not self.pool:
            self.pool = await asyncpg.create_pool(self.db_url)

    async def disconnect(self):
        if self.pool:
            await self.pool.close()

    async def get_pool(self):
        if not self.pool:
            await self.connect()
        return self.pool

# Create a single instance of the Database class
db = Database(DATABASE_URL)
