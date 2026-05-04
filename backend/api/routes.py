from fastapi import APIRouter
from models.schemas import GeoRequest
from services.gee_service import GEEService
from services.landcover_service import LandCoverService
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

    
@router.get("/landcover-map")
def landcover_map():
    return GEEService.get_landcover_map()    

@router.post("/landcover-point")
def get_landcover(data: GeoRequest):
    value = LandCoverService.get_landcover_value(data.lat, data.lon)

    return {
        "lat": data.lat,
        "lon": data.lon,
        "landcover": value
    }