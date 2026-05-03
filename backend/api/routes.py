from fastapi import APIRouter
from models.schemas import GeoRequest
from services.gee_service import GEEService

router = APIRouter()

@router.post("/ndvi")
def get_ndvi(data: GeoRequest):
    result = GEEService.get_ndvi(data.lat, data.lon)

    return {
        "lat": data.lat,
        "lon": data.lon,
        "ndvi": result
    }

@router.get("/ndvi-map")
def ndvi_map():
    return GEEService.get_ndvi_map()