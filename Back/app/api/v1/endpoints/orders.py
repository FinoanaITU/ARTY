from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_orders():
    return {"message": "Get orders"}


@router.get("/{order_id}")
async def get_order(order_id: str):
    return {"message": f"Get order {order_id}"}


@router.post("/")
async def create_order():
    return {"message": "Create order"} 