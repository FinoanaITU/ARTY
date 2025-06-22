from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_cart():
    return {"message": "Get cart"}


@router.post("/items")
async def add_to_cart():
    return {"message": "Add to cart"}


@router.delete("/items/{item_id}")
async def remove_from_cart(item_id: str):
    return {"message": f"Remove item {item_id} from cart"} 