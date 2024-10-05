from fastapi import APIRouter

router = APIRouter()

@router.get("/solarsystem")
def read_item(q: str = None):
    return {"test": q}
