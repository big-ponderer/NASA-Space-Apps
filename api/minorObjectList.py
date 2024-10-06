import pandas as pd 
import requests as req
from api.routers.solarsystem import get_asteroid

class Asteroid:
    def __init__(self, name, diameter, mass, period, displayName, NEO, PHA ):
        self.name = name
        self.diameter = diameter
        self.mass = mass
        self.period = period
        self.displayName = displayName
        #The two are boolean
        self.NEO = NEO
        self.PHA = PHA
        #Set xyz positions to be defined later
        self.sunCoords = [0,0,0]
        self.sectorCoords = [0,0,0]
        #Set quadrant (row and column)
        self.quadrant = [0,0]
     
    def printData(self):
        print(f"Asteroid(name={self.name}, diameter={self.diameter}, mass={self.mass}, period={self.period}, displayName={self.displayName}, NEO={self.NEO}, PHA={self.PHA})")

    def returnQuad(self):
        
        return self.quadrant
        
    
    
#Change this to change asteroid file
asteroidListCSV = pd.read_csv("sbdb_query_results.csv")

print(asteroidListCSV.head())

#main data structure
asteroidList = []

for index, row in asteroidListCSV.iterrows():
    
    asteroid = Asteroid(
        name=row['full_name'],
        diameter=row['diameter'],
        mass=row['GM'],
        period=row['per_y'],
        displayName=row['name'],
        NEO = row['neo'] == 'Y',
        PHA = row['pha'] == 'Y'
    )
    asteroidList.append(asteroid)

asteroidList[0].printData()


def updateAllCoords():
    for asteroid in asteroidList:
        response = get_asteroid(asteroid.displayName)
        
        if response.json()["vectors"]:
            
            asteroid.sunCoords = response.json()["vectors"][0]
        else:
            print(asteroid.printData()) #debug
            
updateAllCoords()