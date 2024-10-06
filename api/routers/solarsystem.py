from fastapi import APIRouter, HTTPException
import httpx
import numpy as np
from pydantic import BaseModel
from mainProcess import getSectorData

router = APIRouter()

class HorizonsAPIClient:
    def __init__(self, command: str, ephem_type: str = "VECTORS"):
        self.base_url = "https://ssd.jpl.nasa.gov/api/horizons.api"
        self.command = command  # This will be the object identifier, e.g., '499' for Mars
        self.ephem_type = ephem_type  # This can be OBSERVER, VECTORS, etc.
        self.format = "json"  # Output format
        self.make_ephem = "YES"  # Toggle ephemeris generation
        self.obj_data = "YES"  # Toggle object summary data
        self.center = "@sun"  # Heliocentric center
        self.start_time = "2024-10-04"  # Start time of ephemeris
        self.stop_time = "2024-10-05"  # Stop time of ephemeris
        self.step_size = "1 d"  # Time step size
        self.quantities = "1,9,20,23,24,29"  # Requested quantities

    def build_url(self) -> str:
        # Build the URL by appending the query parameters
        params = {
            "format": self.format,
            "COMMAND": f"'{self.command}'",  # Object ID, e.g., '499' for Mars
            "OBJ_DATA": self.obj_data,
            "MAKE_EPHEM": self.make_ephem,
            "EPHEM_TYPE": self.ephem_type,
            "CENTER": f"'{self.center}'",
            "OUT_UNITS": "AU-D",
            "START_TIME": f"'{self.start_time}'",
            "STOP_TIME": f"'{self.stop_time}'",
            "STEP_SIZE": f"'{self.step_size}'",
            "QUANTITIES": f"'{self.quantities}'",
        }
        query = "&".join([f"{key}={value}" for key, value in params.items()])
        full_url = f"{self.base_url}?{query}"
        return full_url
    
    async def get_ephemeris_data(self) -> str:
        url = self.build_url()

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                response.raise_for_status()
                return response.json() # return json response
        except httpx.HTTPStatusError as exc:
            print(f"Error: {exc.response.status_code} - {exc.response.text}")
            return None
        
    def extract_vectors(self, data: dict) -> np.ndarray:
        vectors = []
        
        # Check if 'result' key is in the response
        if 'result' not in data:
            print("Error: 'result' key not found in response.")
            return np.array([])  # Return empty array if 'result' is missing

        # Get the result text
        result_text = data["result"]

        # Split the result text into lines
        lines = result_text.splitlines()

        # Flag to track when we are inside the $$SOE and $$EOE section
        inside_soe = False

        for line in lines:
            if line.startswith("$$SOE"):
                inside_soe = True
                continue
            elif line.startswith("$$EOE"):
                inside_soe = False
                continue

            if inside_soe:
                # Process lines to extract X, Y, Z values
                print(line)
                if "X =" in line and "Y =" in line and "Z =" in line:
                    # Extract X, Y, Z from the line
                    parts = line.strip().split('=')
                    
                    try:
                        x = float(parts[1].strip().split(' ')[0])  # X is at index 1
                        y = float(parts[2].strip().split(' ')[0])  # Y is at index 2
                        z = float(parts[3].strip())  # Z is at index 3
                        
                        vectors.append([x, y, z])
                    except (ValueError, IndexError) as e:
                        print(f"Error processing line: {line}. Exception: {e}.")

        return np.array(vectors)


async def get_asteroid(asteroid_name):
    try:
        # Hardcoding command for Mars ('499')
        client = HorizonsAPIClient(command = asteroid_name)  # Mars' command is '499'
        ephemeris_data = await client.get_ephemeris_data()

        if ephemeris_data:
            # Return the response as structured data
            vectors = client.extract_vectors(ephemeris_data)
            return {"vectors": vectors.tolist()}
        else:
            return {
                "status_code": 500, 
                "detail": "Failed to retrieve ephemeris data"
            }
        
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=str(exc))


@router.get("/solarsystem")
def read_item():
    print("called")
    data = getSectorData()
    return data