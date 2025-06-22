from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_products():
    return {"message": "Get products"}


@router.get("/{product_id}")
async def get_product(product_id: str):
    return {"message": f"Get product {product_id}"}


@router.post("/")
async def create_product():
    return {"message": "Create product"}


@router.put("/{product_id}")
async def update_product(product_id: str):
    return {"message": f"Update product {product_id}"}


@router.delete("/{product_id}")
async def delete_product(product_id: str):
    return {"message": f"Delete product {product_id}"} 