from fastapi import APIRouter, HTTPException
from app.models.user import UserCreate, User
from app.services.user_service import UserService

router = APIRouter()
router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=User)
async def create_user(user: UserCreate):
    return await UserService.create_user(user)

@router.get("/{user_id}", response_model=User)
async def get_user(user_id: int):
    user = await UserService.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=List[User])
async def list_users():
    return await UserService.get_all_users()

@router.put("/{user_id}")
async def update_user(user_id: int, user_data: dict):
    await UserService.update_user(user_id, user_data)
    return {"message": "User updated successfully"}

@router.delete("/{user_id}")
async def delete_user(user_id: int):
    await UserService.delete_user(user_id)
    return {"message": "User deleted successfully"}
