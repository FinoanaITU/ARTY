from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_users():
    return {"message": "Get users"}


@router.get("/{user_id}")
async def get_user(user_id: str):
    return {"message": f"Get user {user_id}"}


@router.put("/{user_id}")
async def update_user(user_id: str):
    return {"message": f"Update user {user_id}"}


@router.delete("/{user_id}")
async def delete_user(user_id: str):
    return {"message": f"Delete user {user_id}"} 