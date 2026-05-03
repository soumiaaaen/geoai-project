from pydantic import BaseModel

class GeoRequest(BaseModel):
    lat: float
    lon: float