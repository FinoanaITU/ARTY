from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_categories():
    return {"message": "Get categories"}


@router.get("/{category_id}")
async def get_category(category_id: str):
    return {"message": f"Get category {category_id}"} 