import pandas as pd
import math 
"""
Last circle does not define a sector
Units for angles are in degrees
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
        print(f"Asteroid(name={self.name}, diameter={self.diameter}, mass={self.mass}, period={self.period}, displayName={self.displayName}, NEO={self.NEO}, PHA={self.PHA})")

    def returnSector(self):
        return self.sector()
    def determineSector (self, sector sec):
        for (i, circle) in enumerate(sec.getCircleList()):
            if math.hypot(self.sunCoords[0],self.sunCoords[1]) > circle:
                self.sector[0] = i
                break
        self.sector [1] = int(math.atan2(self.sunCoords[1], self.sunCoords[0]) / sec.getTheta())


#The individual data for each sector (will be passed to front end)
class indivSect:
    def __init__(self, index)
        #willbeArray
        self.index = index
        self.asteroidList = []
        self.area = 0
        self.density = 0
    def addAsteroid(self, asteroid):
        self.asteroidList.append(asteroid)
    
    def calcArea(self, sector sec):
        self.area = math.pi * (sec.getCircleList()[self.index[0]+1] **2 - sec.getCircleList()[self.index[0]] ** 2) * sec.getTheta()/360
        
    def calcDensity(self):
        self.density = len(self.asteroidList) / self.area

        

#Change this to change asteroid file
asteroidListCSV = pd.read_csv("api/routers/MinorObjects_code_and_file/sbdb_query_results.csv")

testSector = sector([0, 0.5, 0.75, 1, 1.25,  1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 4.0, 4.25, 4.5, 4.75, 5.0, 5.25, 5.5], 2) 

print(asteroidListCSV.head())

#create the first iteration of the asteroid list, without any parameters
asteroidList = []

#make an array of sectors
mainArray = [testSector.getCircleList().__sizeof__()][360/testSector.getTheta]
for i in range (0, testSector.getCircleList().__sizeof__()):
    for j in range (0, 360/testSector.getTheta):
        mainArray[i][j] = indivSect([i,j])






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

#Do Leo andKaushik's stuff here (call the API and get data), as well as define the sector of each asteroid
#Add the asteroid to the appropriate sector
for asteroid in asteroidList:
    #call the API and get data


    asteroid.determineSector(testSector)
    mainArray[asteroid.sector[0]][asteroid.sector[1]].addAsteroid(asteroid)


#process area and density for each sector
for i in range (0, testSector.getCircleList().__sizeof__()):
    for j in range (0, 360/testSector.getTheta):
        mainArray[i][j].calcArea(testSector)
        mainArray[i][j].calcDensity()

#***Get rid of the list of asteroids****
del asteroidList
    
