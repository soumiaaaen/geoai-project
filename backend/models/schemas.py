from pydantic import BaseModel
from typing import Optional, List

class GeoRequest(BaseModel):
    lat: float
    lon: float

class ZoneSelection(BaseModel):
    granularite: str  # "point", "bbox", "province", "region", "national"
    lat: Optional[float] = None
    lon: Optional[float] = None
    bbox: Optional[List[float]] = None  # [minLon, minLat, maxLon, maxLat]
    code: Optional[str] = None  # province or region name

class AnalyseRequest(BaseModel):
    zoneSelection: ZoneSelection
    dateDebut: str   # "YYYY-MM-DD"
    dateFin: str     # "YYYY-MM-DD"