from fastapi import APIRouter

router = APIRouter()

@router.get("/sector/{sector_id}")
def read_item(sector_id: int):
    return {"sector_id": sector_id}
