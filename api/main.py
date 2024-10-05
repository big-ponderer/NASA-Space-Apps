from fastapi import FastAPI
from routers import solarsystem, sector

app = FastAPI()

# Include the routers
app.include_router(solarsystem.router)
app.include_router(sector.router)

@app.get("/")
def read_root():
    return {"message": "server running"}
