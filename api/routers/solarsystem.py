from fastapi import APIRouter, HTTPException
import httpx
import numpy as np
from pydantic import BaseModel
from mainProcess import getSolarSystem

router = APIRouter()



@router.get("/solarsystem")
async def read_item():
    print("called")
    data = await getSolarSystem()
    return data