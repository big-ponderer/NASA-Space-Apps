import pandas as pd
import math 
from get_asteroids import get_asteroid
"""
Last circle does not define a sector
Units for angles are in degrees
90 degrees must be a multiple of waveTheta
"""
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
    
    def determineSectorCoords(self, sec):
        thetaR = self.sector[1] * sec.waveTheta
        secx = 0
        secy =0
        #Overunder says whether the value is on the wider x size of a quadrant, and x has to be negative
        overunder =1
        if thetaR < 90:
            secx = math.cos(thetaR) * sec.getCircleList()[self.sector[0]]
            secy = math.sin(thetaR) * sec.getCircleList()[self.sector[0]]
        elif thetaR < 180:
            secx = -math.cos(thetaR) * sec.getCircleList()[self.sector[0]]
            secy = math.sin(thetaR) * sec.getCircleList()[self.sector[0]]
        elif thetaR < 270:
            secx = -math.cos(thetaR) * sec.getCircleList()[self.sector[0]]
            secy = -math.sin(thetaR) * sec.getCircleList()[self.sector[0]]
        else:
            secx = math.cos(thetaR) * sec.getCircleList()[self.sector[0]]
            secy = -math.sin(thetaR) * sec.getCircleList()[self.sector[0]]
        
        degrees = math.degrees(math.atan2(self.sunCoords[1], self.sunCoords[0]))
        if degrees < 0:
            degrees += 360
        if (thetaR < degrees):
            overunder = -1
        self.sectorCoords = [overunder*abs(self.sunCoords[0]-secx), abs (self.sunCoords[1] -secy), self.sunCoords[2]]

#The individual data for each sector (will be passed to front end)
class indivSect:
    def __init__(self, index):
        #willbeArray
        self.index = index
        self.asteroidList = []
        self.area = 0
        self.density = 0

    def addAsteroid(self, asteroid):
        self.asteroidList.append(asteroid)
    
    def calcArea(self, sec):
        self.area = math.pi * (sec.getCircleList()[self.index[0]+1] **2 - sec.getCircleList()[self.index[0]] ** 2) * sec.waveTheta/360
        
    def calcDensity(self):
        self.density = len(self.asteroidList) / self.area

async def getSolarSystem():
    #Change this to change asteroid file
    asteroidListCSV = pd.read_csv("sbdb_query_results-3.csv")

    testSector = sector([0, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 4.0, 4.25, 4.5, 4.75, 5.0, 5.25, 5.5, 10, 40], 2) 

    print(asteroidListCSV.head())

    #create the first iteration of the asteroid list, without any parameters
    asteroidList = []

    #make an array of sectors
    mainArray = [[indivSect([i,j]) for i in range( int(360/testSector.waveTheta))] for j in range( int(len(testSector.getCircleList()))-1)]







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

    #asteroidList[0].printData()

    #Do Leo and Kaushik's stuff here (call the API and get data), as well as define the sector of each asteroid
    #Add the asteroid to the appropriate sector
    for asteroid in asteroidList:
        #call the API and get data
        resp = await get_asteroid(asteroid.displayName)

        if resp:
            asteroid.sunCoords = resp[0]
            asteroid.determineSector(testSector)
            asteroid.determineSectorCoords(testSector)
            print( "********", asteroid.displayName, "sector coords", asteroid.sectorCoords)
            mainArray[asteroid.sector[0]][asteroid.sector[1]].addAsteroid(asteroid)


    #process area and density for each sector
    # for i in range (0, len(testSector.getCircleList())-1):
    #     for j in range (0, int(360/testSector.waveTheta)) :
    #         mainArray[i][j].calcArea(testSector)
    #         mainArray[i][j].calcDensity()

    return mainArray
        
#getSolarSystem()
