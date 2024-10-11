import pandas as pd
import math 
from get_asteroids import get_asteroid
from tqdm import tqdm

"""
Last circle does not define a sector
Units for angles are in degrees
90 degrees must be a multiple of waveTheta
"""

        
#The asteroid class
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
        self.sector = [0,0]
        #velocity
        self.velocity = [0, 0, 0] #AU/Days

     
    def printData(self):
        print("Asteroid(name={self.name}, diameter={self.diameter}, mass={self.mass}, period={self.period}, displayName={self.displayName}, NEO={self.NEO}, PHA={self.PHA})")

    def returnSector(self):
        return self.sector()

    
    def determineSector (self, sec):
        for (i, circle) in enumerate(sec.getCircleList()):
            if math.hypot(self.sunCoords[0],self.sunCoords[1]) < circle:
                self.sector[0] = i - 1
                break
        degrees = math.degrees(math.atan2(self.sunCoords[1], self.sunCoords[0]))
        if degrees < 0:
            degrees += 360
        self.sector[1] = int(degrees/sec.waveTheta)
    
    def materialsofInterest(self):
        if self.mass :
            density = self.mass/6.67E-11 / (4/3 * math.pi * (self.diameter*1000/2)**3)
            if density < 1420:
                return "not many"
            elif density < 4000:
                "nickel and iron"
            else:
                return "rare metals"
        else:
            return "unknown"
        

class AllAsteroids:
    def __init__(self, file_name, preload):
        self.asteroidListCSV = []
        self.asteroidList = []

        self.testSector = sector([0, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 4.0, 4.25, 4.5, 4.75, 5.0, 5.25, 5.5, 6], 360/30) 
        self.mainArray = [[indivSect([i,j]) for i in range(int(360/self.testSector.waveTheta))] for j in range( int(len(self.testSector.getCircleList()))-1)]
        self.readCSV(file_name)
        
    def readCSV(self, file_name):
        self.asteroidListCSV = pd.read_csv(file_name)

        for index, row in self.asteroidListCSV.iterrows():
            asteroid = Asteroid(
                name=row['full_name'],
                diameter=row['diameter'],
                mass=row['GM'],
                period=row['per_y'],
                displayName=row['name'],
                NEO = row['neo'] == 'Y',
                PHA = row['pha'] == 'Y'
            )
            self.asteroidList.append(asteroid)


    async def updateAllCoords(self, preload):
        if preload:
            coolListCSV = pd.read_csv("cooler_asteroids_coordinates.csv")
            for index, row in coolListCSV.iterrows():
                asteroid = self.asteroidList[index]
                asteroid.sunCoords = [row["Sun Coords X"], row["Sun Coords Y"], row["Sun Coords Z"]]
                asteroid.velocity = [row["Velocity X"], row["Velocity Y"], row["Velocity Z"]]
                asteroid.determineSector(self.testSector)

                self.mainArray[asteroid.sector[0]][asteroid.sector[1]].addAsteroid(asteroid)

        else:

            for asteroid in tqdm(self.asteroidList, desc="Processing asteroids", unit="asteroid"):
            #call the API and get data
                resp = await get_asteroid(asteroid.displayName)

                if resp[0] and resp[1]:
                    asteroid.sunCoords = resp[0][0]
                    asteroid.velocity = resp[1][0]
                    asteroid.determineSector(self.testSector)
                    
                    self.mainArray[asteroid.sector[0]][asteroid.sector[1]].addAsteroid(asteroid)

        return self.mainArray


# Stores the dimensions of the sectors so we can change them
class sector:
    def __init__(self, circleList, waveTheta):
        self.circleList = circleList
        self.waveTheta = waveTheta
    def addCircle(self, circleRadius):
        self.circleList.append(circleRadius)
    def getTheta(self):
        return self.waveTheta
    def getCircleList(self):
        return self.circleList
    def orderCircles(self):
        self.circleList.sort()


    


#The individual data for each sector (will be passed to front end)
class indivSect:
    def __init__(self, index):
        #willbeArray
        self.index = index
        self.asteroidSectorList = []
        self.area = 0
        self.density = 0

    def addAsteroid(self, asteroid):
        self.asteroidSectorList.append(asteroid)
    
    def calcArea(self, sec):
        self.area = math.pi * (sec.getCircleList()[self.index[0]+1] **2 - sec.getCircleList()[self.index[0]] ** 2) * sec.waveTheta/360
        return self.area
        
    def calcDensity(self):
         self.density = len(self.asteroidSectorList) / self.area
