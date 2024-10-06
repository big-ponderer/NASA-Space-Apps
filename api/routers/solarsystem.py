from fastapi import APIRouter, HTTPException
import httpx
import numpy as np
from pydantic import BaseModel

from mainProcess import AllAsteroids



router = APIRouter()
@router.get("/solarsystem")
async def read_item():
    try:
        asteroids = AllAsteroids("sbdb_query_results-3.csv")
        mainArray =  await asteroids.updateAllCoords()
        sectors = {}
        """for i in ran
        ret = {
            "radii": asteroids.testSector.circleList,
            "angles": asteroids.testSector.waveTheta*2*np.pi/360,
            "sectors": mainArray
        }"""
        return mainArray
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
