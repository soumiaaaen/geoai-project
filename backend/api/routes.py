from fastapi import APIRouter, Depends, HTTPException
from models.schemas import GeoRequest, ZoneSelection, AnalyseRequest
from services.gee_service import GEEService
from services.landcover_service import LandCoverService
from services.zone_service import ZoneService
from services.subscription_service import subscription_service
from config.plans import validate_plan_access, PlanViolation
from api.auth import verify_token, get_principal_id
import json

router = APIRouter()


def _enforce_zone_plan(
    principal_id: str,
    zone: ZoneSelection,
    date_debut: str | None = None,
    date_fin: str | None = None,
    active_module: str | None = None,
    check_quota: bool = False,
):
    plan = subscription_service.get_user_plan(principal_id)
    used = subscription_service.get_usage_count(principal_id) if check_quota else 0
    try:
        validate_plan_access(
            plan,
            active_module=active_module,
            granularite=zone.granularite,
            date_debut=date_debut,
            date_fin=date_fin,
            bbox=zone.bbox,
            analyses_used=used,
            check_quota=check_quota,
        )
    except PlanViolation as e:
        raise HTTPException(status_code=e.status_code, detail=e.message) from e


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
def resolve_zone(
    data: ZoneSelection,
    principal_id: str = Depends(get_principal_id),
):
    _enforce_zone_plan(principal_id, data)

    geom = ZoneService.resolve_zone_geometry(data)

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
        "type": data.granularite,
    }


@router.get("/zones/provinces")
def get_provinces():
    return ZoneService.get_provinces_geojson()


@router.get("/zones/regions")
def get_regions():
    return ZoneService.get_regions_geojson()


@router.post("/analyse")
def run_analysis(
    data: AnalyseRequest,
    principal_id: str = Depends(get_principal_id),
):
    zone = data.zoneSelection
    _enforce_zone_plan(
        principal_id,
        zone,
        date_debut=data.dateDebut,
        date_fin=data.dateFin,
        active_module=data.activeModule,
        check_quota=True,
    )

    geom = ZoneService.resolve_zone_geometry(zone)
    result = GEEService.run_analysis(geom, data.dateDebut, data.dateFin)
    usage = subscription_service.increment_usage(principal_id)
    plan = subscription_service.get_user_plan(principal_id)
    limits = subscription_service.get_plan_summary(principal_id)
    result["usage"] = {
        "analysesUsed": usage,
        "analysesLimit": limits["analysesLimit"],
        "quotaPeriod": limits.get("quotaPeriod"),
        "plan": plan,
    }
    return result


@router.get("/timeseries")
def get_timeseries(zone: str, dateDebut: str, dateFin: str, dataset: str):
    zone_data = json.loads(zone)
    zone_selection = ZoneSelection(**zone_data)
    geom = ZoneService.resolve_zone_geometry(zone_selection)

    result = GEEService.get_timeseries(geom, dateDebut, dateFin, dataset)
    return result


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/zones", dependencies=[Depends(verify_token)])
def get_zones():
    return {"zones": []}


@router.get("/landcover", dependencies=[Depends(verify_token)])
def get_landcover_protected():
    return {"data": []}
