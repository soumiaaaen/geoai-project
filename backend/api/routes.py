from fastapi import APIRouter
from models.schemas import GeoRequest, ZoneSelection, AnalyseRequest
from services.gee_service import GEEService
from services.landcover_service import LandCoverService
from services.zone_service import ZoneService
import json
from fastapi import APIRouter, Depends
from api.auth import verify_token

router = APIRouter()

@router.post("/ndvi")
def get_ndvi(data: GeoRequest):
    result = GEEService.get_ndvi(data.lat, data.lon)
    return {"lat": data.lat, "lon": data.lon, "ndvi": result}

@router.get("/ndvi-map")
def ndvi_map():
    return GEEService.get_ndvi_map()

@router.get("/landcover-map")
def landcover_map():
    return GEEService.get_landcover_map()

@router.get("/gwsa-map")
def gwsa_map():
    return GEEService.get_gwsa_map()

@router.get("/water-extent-map")
def water_extent_map():
    return GEEService.get_water_extent_map()

@router.post("/landcover-point")
def get_landcover(data: GeoRequest):
    value = LandCoverService.get_landcover_value(data.lat, data.lon)
    return {"lat": data.lat, "lon": data.lon, "landcover": value}

@router.post("/zones/resolve")
def resolve_zone(data: ZoneSelection):
    geom = ZoneService.resolve_zone_geometry(data)
    
    # Generate label based on granularity
    if data.granularite == "point":
        label = f"Point ({data.lat:.4f}, {data.lon:.4f})"
    elif data.granularite == "bbox":
        label = f"BBox ({data.bbox[0]:.2f}, {data.bbox[1]:.2f}, ...)"
    elif data.granularite in ["province", "region"]:
        label = data.code
    elif data.granularite == "national":
        label = "Maroc (National)"
    else:
        label = "Zone Inconnue"
        
    return {
        "geojson": geom.getInfo(),
        "label": label,
        "type": data.granularite
    }

@router.get("/zones/provinces")
def get_provinces():
    return ZoneService.get_provinces_geojson()

@router.get("/zones/regions")
def get_regions():
    return ZoneService.get_regions_geojson()

@router.post("/analyse")
def run_analysis(data: AnalyseRequest):
    geom = ZoneService.resolve_zone_geometry(data.zoneSelection)
    result = GEEService.run_analysis(geom, data.dateDebut, data.dateFin)
    return result

@router.get("/timeseries")
def get_timeseries(zone: str, dateDebut: str, dateFin: str, dataset: str):
    zone_data = json.loads(zone)
    zone_selection = ZoneSelection(**zone_data)
    geom = ZoneService.resolve_zone_geometry(zone_selection)
    
    result = GEEService.get_timeseries(geom, dateDebut, dateFin, dataset)
    return result


# Public route
@router.get("/health")
def health():
    return {"status": "ok"}

# Protected route — add Depends(verify_token) to any route you want to secure
@router.get("/zones", dependencies=[Depends(verify_token)])
def get_zones():
    return {"zones": []}

@router.get("/landcover", dependencies=[Depends(verify_token)])
def get_landcover():
    return {"data": []}