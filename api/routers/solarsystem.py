from fastapi import APIRouter, HTTPException
import httpx
from pydantic import BaseModel

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
        self.start_time = "2024-01-19"  # Start time of ephemeris
        self.stop_time = "2024-01-20"  # Stop time of ephemeris
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
                return response.text  # Return the plain text response
        except httpx.HTTPStatusError as exc:
            print(f"Error: {exc.response.status_code} - {exc.response.text}")
            return None


@router.get("/solarsystem")
async def read_item():
    try:
        # Hardcoding command for Mars ('499')
        client = HorizonsAPIClient(command="499")  # Mars' command is '499'
        ephemeris_data = await client.get_ephemeris_data()

        if ephemeris_data:
            # Return the response as structured data
            return {"data": ephemeris_data}
        else:
            raise HTTPException(status_code=500, detail="Failed to retrieve ephemeris data")
        
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=str(exc))
