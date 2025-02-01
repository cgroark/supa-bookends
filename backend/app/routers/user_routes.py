from fastapi import APIRouter, Depends, HTTPException
from app.utils.auth import validate_token
from app.models.user import User
from app.services.user_service import UserService
from uuid import UUID

router = APIRouter(prefix="/users", tags=["Users"])

# @router.get("/profile")
# async def get_user_profile(token_data: dict = Depends(validate_token)):
#     # Protected route: Return user profile based on token data
#     return {"message": "User is authenticated", "token_data": token_data}


@router.post("/", response_model=User)
async def create_user(user: User):
    print('user in route', user)
    return await UserService.create_user(user)

@router.get("/{user_id}", response_model=User)
async def get_user(user_id: UUID):
    user = await UserService.get_user_by_id(user_id)
    print("User being returned:", user)  # Ensure this prints the correct data

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=list[User])
async def list_users():
    return await UserService.get_all_users()

@router.put("/{user_id}")
async def update_user(user_id: UUID, user_data: dict):
    await UserService.update_user(user_id, user_data)
    return {"message": "User updated successfully"}

@router.delete("/{user_id}")
async def delete_user(user_id: UUID):
    await UserService.delete_user(user_id)
    return {"message": "User deleted successfully"}
