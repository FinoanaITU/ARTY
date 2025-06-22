from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_workshops():
    return {"message": "Get workshops"}


@router.get("/{workshop_id}")
async def get_workshop(workshop_id: str):
    return {"message": f"Get workshop {workshop_id}"} 