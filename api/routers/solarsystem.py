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
        #print(mainArray)
        sectors = []
        for i in range(len(mainArray)):
            one_layer = []
            for j in range(len(mainArray[i])):
                output_dic = {}
                output_dic["id"] = [i, j]
                output_dic["density"] = len(mainArray[i][j].asteroidSectorList)
                asteroid_list = []
                asteroid_dict = {}
                for asteroid in mainArray[i][j].asteroidSectorList:
                    asteroid_dict = {
                        "position": asteroid.sunCoords, 
                        "velocity": asteroid.velocity,
                        "radius": asteroid.diameter
                    }
                asteroid_list.append(asteroid_dict)
                output_dic["asteroids"] = asteroid_list
                one_layer.append(output_dic)
            sectors.append(one_layer)
        #print(sectors, "working")
        print(type(sectors))
        ret = {
            "radii": asteroids.testSector.circleList,
            "angles": asteroids.testSector.waveTheta*2*np.pi/360,
            "sectors": sectors
        }
        #print(ret)
        return ret
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
