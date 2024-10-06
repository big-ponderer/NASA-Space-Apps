from fastapi import APIRouter, HTTPException
import httpx
import numpy as np
from pydantic import BaseModel
import csv

from mainProcess import AllAsteroids



router = APIRouter()
@router.get("/solarsystem")
async def read_item():
    try:
        asteroids = AllAsteroids("coolerAsteroids.csv", preload=True)
        mainArray =  await asteroids.updateAllCoords(preload=True)
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
                cam_pos = [0.1, 0.1, 0]
                sum_pos = np.array([0.0, 0.0, 0.0])
                for asteroid in mainArray[i][j].asteroidSectorList:
                    sum_pos += np.array(asteroid.sunCoords)
                    asteroid_dict = {
                        "position": asteroid.sunCoords, 
                        "velocity": asteroid.velocity,
                        "radius": asteroid.diameter/2*6.68459e-9,
                        "name": asteroid.displayName,
                        "nearEarth": asteroid.NEO == 'Y',
                        "hazardous": asteroid.PHA == 'Y',
                        "mass": asteroid.mass/6.67E-11,
                        "period": asteroid.period,
                        "intestRez": asteroid.materialsofInterest()
                    }
                if len(mainArray[i][j].asteroidSectorList) >0:
                    cam_pos = (sum_pos/len(mainArray[i][j].asteroidSectorList)).tolist()
                    asteroid_list.append(asteroid_dict)
                output_dic["asteroids"] = asteroid_list
                output_dic["cameraPos"] = {"x":cam_pos[0], "y":cam_pos[1], "z":cam_pos[2]}
                one_layer.append(output_dic)
            sectors.append(one_layer)
        #print(sectors, "working")
        #print(type(sectors))
        ret = {
            "radii": asteroids.testSector.circleList,
            "angles": asteroids.testSector.waveTheta*2*np.pi/360,
            "sectors": sectors
        }
        #print(ret)
        return ret
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
