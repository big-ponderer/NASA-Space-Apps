from fastapi import FastAPI
from fastapi.responses import JSONResponse
import typing
import orjson
from routers import solarsystem, sector

class ORJSONResponse(JSONResponse):
    media_type = "application/json"

    def render(self, content: typing.Any) -> bytes:
        return orjson.dumps(content)

app = FastAPI(default_response_class=ORJSONResponse)

# Include the routers
app.include_router(solarsystem.router)
app.include_router(sector.router)

@app.get("/")
def read_root():
    return {"message": "server running"}
