import ee
import concurrent.futures


class GEEService:

    # ─────────────────────────────────────────────────────────────────────────
    # GEOMETRY HELPERS
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    def get_morocco_geometry():
        """Full Morocco geometry including Western Sahara."""
        countries = ee.FeatureCollection("FAO/GAUL/2015/level0")
        return countries.filter(
            ee.Filter.Or(
                ee.Filter.eq("ADM0_NAME", "Morocco"),
                ee.Filter.eq("ADM0_NAME", "Western Sahara")
            )
        ).geometry()

    @staticmethod
    def get_morocco_country_codes():
        """
        Returns the ADM0_CODE values for Morocco and Western Sahara.
        Used to filter level1/level2 provinces and regions.
        """
        level0 = ee.FeatureCollection("FAO/GAUL/2015/level0")
        codes = level0.filter(
            ee.Filter.Or(
                ee.Filter.eq("ADM0_NAME", "Morocco"),
                ee.Filter.eq("ADM0_NAME", "Western Sahara")
            )
        ).aggregate_array("ADM0_CODE").getInfo()
        return codes  # e.g. [504, 732]

    @staticmethod
    def get_provinces_geojson():
        """
        Returns GeoJSON FeatureCollection of ALL Moroccan provinces
        including Western Sahara provinces (level2).
        FIX: filter by ADM0_CODE of both Morocco AND Western Sahara.
        """
        try:
            codes = GEEService.get_morocco_country_codes()
            provinces = ee.FeatureCollection("FAO/GAUL/2015/level2") \
                .filter(ee.Filter.inList("ADM0_CODE", codes)) \
                .select(["ADM0_NAME", "ADM1_NAME", "ADM2_NAME"])
            return provinces.getInfo()  # GeoJSON FeatureCollection
        except Exception as e:
            print(f"Error in get_provinces_geojson: {e}")
            return None

    @staticmethod
    def get_regions_geojson():
        """
        Returns GeoJSON FeatureCollection of ALL Moroccan regions
        including Western Sahara regions (level1).
        FIX: filter by ADM0_CODE of both Morocco AND Western Sahara.
        """
        try:
            codes = GEEService.get_morocco_country_codes()
            regions = ee.FeatureCollection("FAO/GAUL/2015/level1") \
                .filter(ee.Filter.inList("ADM0_CODE", codes)) \
                .select(["ADM0_NAME", "ADM1_NAME"])
            return regions.getInfo()  # GeoJSON FeatureCollection
        except Exception as e:
            print(f"Error in get_regions_geojson: {e}")
            return None

    @staticmethod
    def get_province_geometry(province_name: str):
        """Returns geometry of a specific province by ADM2_NAME."""
        try:
            codes = GEEService.get_morocco_country_codes()
            province = ee.FeatureCollection("FAO/GAUL/2015/level2") \
                .filter(ee.Filter.inList("ADM0_CODE", codes)) \
                .filter(ee.Filter.eq("ADM2_NAME", province_name))
            return province.geometry()
        except Exception as e:
            print(f"Error in get_province_geometry: {e}")
            return None

    @staticmethod
    def get_region_geometry(region_name: str):
        """Returns geometry of a specific region by ADM1_NAME."""
        try:
            codes = GEEService.get_morocco_country_codes()
            region = ee.FeatureCollection("FAO/GAUL/2015/level1") \
                .filter(ee.Filter.inList("ADM0_CODE", codes)) \
                .filter(ee.Filter.eq("ADM1_NAME", region_name))
            return region.geometry()
        except Exception as e:
            print(f"Error in get_region_geometry: {e}")
            return None

    # ─────────────────────────────────────────────────────────────────────────
    # TILE MAP ENDPOINTS
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    def get_ndvi(lat, lon, scale=30):
        """Returns NDVI value at a single point (most recent Sentinel-2 image)."""
        try:
            point = ee.Geometry.Point([lon, lat])
            image = (
                ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                .filterBounds(point)
                .sort("system:time_start", False)
                .first()
            )
            ndvi = image.normalizedDifference(["B8", "B4"]).rename("NDVI")
            value = ndvi.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=point,
                scale=scale
            ).get("NDVI")
            return value.getInfo()
        except Exception as e:
            print(f"Error in get_ndvi: {e}")
            return None

    @staticmethod
    def get_ndvi_map():
        """Returns tile URL for NDVI map over Morocco (2024 median)."""
        try:
            region = GEEService.get_morocco_geometry()
            image = (
                ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                .filterBounds(region)
                .filterDate("2024-01-01", "2024-12-31")
                .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
                .median()
                .clip(region)
            )
            ndvi = image.normalizedDifference(["B8", "B4"]).rename("NDVI")
            vis = ndvi.visualize(
                min=0,
                max=1,
                palette=["#8B0000", "#FFFF00", "#00FF00"]
            )
            map_id = vis.getMapId()
            return {
                "mapid": map_id["mapid"],
                "token": map_id["token"],
                "tile_url": map_id["tile_fetcher"].url_format
            }
        except Exception as e:
            print(f"Error in get_ndvi_map: {e}")
            return None

    @staticmethod
    def get_landcover_map():
        """Returns tile URL for ESA WorldCover land use map over Morocco."""
        try:
            region = GEEService.get_morocco_geometry()
            image = (
                ee.Image("ESA/WorldCover/v200/2021")
                .select("Map")
                .clip(region)
            )
            vis_params = {
                "min": 10,
                "max": 100,
                "palette": [
                    "006400",  # 10 — Forest
                    "ffbb22",  # 20 — Shrubland
                    "ffff4c",  # 30 — Grassland
                    "f096ff",  # 40 — Cropland
                    "fa0000",  # 50 — Urban
                    "b4b4b4",  # 60 — Bare land
                    "f0f0f0",  # 70 — Snow/Ice
                    "0064c8",  # 80 — Water
                ],
            }
            map_id = image.getMapId(vis_params)
            return {
                "mapid": map_id["mapid"],
                "token": map_id["token"],
                "tile_url": map_id["tile_fetcher"].url_format
            }
        except Exception as e:
            print(f"Error in get_landcover_map: {e}")
            return None

    @staticmethod
    def get_gwsa_map():
        """Returns tile URL for GRACE GWSA map over Morocco."""
        try:
            region = GEEService.get_morocco_geometry()
            collection = ee.ImageCollection("NASA/GRACE/MASS_GRIDS_V04/MASCON_CRI").select("lwe_thickness")
            
            # The GRACE MASCON dataset is already an anomaly relative to the 2004-2010 baseline.
            # We just grab the most recent month's data to guarantee availability and speed.
            anomaly = collection.sort("system:time_start", False).first().clip(region)
            
            vis_params = {
                "min": -20,
                "max": 20,
                "palette": ["EF4444", "F9FAFB", "3B82F6"] # Red to White to Blue
            }
            map_id = anomaly.getMapId(vis_params)
            return {
                "mapid": map_id["mapid"],
                "token": map_id["token"],
                "tile_url": map_id["tile_fetcher"].url_format
            }
        except Exception as e:
            print(f"Error in get_gwsa_map: {e}")
            return None

    @staticmethod
    def get_water_extent_map():
        """Returns tile URL for Water extent map over Morocco (JRC)."""
        try:
            region = GEEService.get_morocco_geometry()
            # Use JRC Global Surface Water for instant tile rendering
            jrc = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").select("occurrence").clip(region)
            
            # Mask out areas with 0 water occurrence
            water_mask = jrc.gt(0).selfMask()
            
            vis_params = {
                "min": 1,
                "max": 1,
                "palette": ["3B82F6"] # Blue
            }
            map_id = water_mask.getMapId(vis_params)
            return {
                "mapid": map_id["mapid"],
                "token": map_id["token"],
                "tile_url": map_id["tile_fetcher"].url_format
            }
        except Exception as e:
            print(f"Error in get_water_extent_map: {e}")
            return None

    # ─────────────────────────────────────────────────────────────────────────
    # ANALYSIS — INDIVIDUAL EXTRACTORS
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    def _extract_gwsa(zone, date_debut, date_fin):
        """
        Groundwater Storage Anomaly from GRACE MASCON.
        FIX: anomaly = current_mean - reference_mean (2004-2023).
        Returns value in cm water equivalent.
        """
        try:
            collection = ee.ImageCollection("NASA/GRACE/MASS_GRIDS_V04/MASCON_CRI")
            band = "lwe_thickness"

            # Current period mean
            current_mean = (
                collection
                .filterDate(date_debut, date_fin)
                .mean()
                .select(band)
                .reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=zone,
                    scale=5000,
                    maxPixels=1e9
                )
                .get(band)
                .getInfo()
            )

            # Long-term reference mean (2004-2023)
            ref_mean = (
                collection
                .filterDate("2004-01-01", "2023-12-31")
                .mean()
                .select(band)
                .reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=zone,
                    scale=5000,
                    maxPixels=1e9
                )
                .get(band)
                .getInfo()
            )

            if current_mean is not None and ref_mean is not None:
                return round(current_mean - ref_mean, 3)
            return None
        except Exception as e:
            print(f"Error in _extract_gwsa: {e}")
            return None

    @staticmethod
    def _extract_precipitation(zone, date_debut, date_fin):
        """
        Total precipitation from CHIRPS Daily over the period (mm).
        FIX: use .mean() per reducer on summed image, not double .sum().
        """
        try:
            # Sum daily values → total mm over the period
            img = (
                ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
                .filterDate(date_debut, date_fin)
                .sum()  # sum all daily images → total mm
            )
            total = (
                img
                .select("precipitation")
                .reduceRegion(
                    reducer=ee.Reducer.mean(),  # mean over the zone pixels
                    geometry=zone,
                    scale=5000,
                    maxPixels=1e9
                )
                .get("precipitation")
                .getInfo()
            )
            return round(total, 2) if total is not None else None
        except Exception as e:
            print(f"Error in _extract_precipitation: {e}")
            return None

    @staticmethod
    def _extract_et(zone, date_debut, date_fin):
        """
        Total evapotranspiration from MODIS MOD16A2 (mm).
        Scale factor: × 0.1. Sums 8-day composites over the period.
        """
        try:
            img = (
                ee.ImageCollection("MODIS/061/MOD16A2")
                .filterDate(date_debut, date_fin)
                .select("ET")
                .sum()  # sum all 8-day composites
            )
            total = (
                img
                .reduceRegion(
                    reducer=ee.Reducer.mean(),  # mean over the zone pixels
                    geometry=zone,
                    scale=500,
                    maxPixels=1e9
                )
                .get("ET")
                .getInfo()
            )
            if total is not None:
                return round(total * 0.1, 2)  # apply scale factor
            return None
        except Exception as e:
            print(f"Error in _extract_et: {e}")
            return None

    @staticmethod
    def _extract_ndvi_ndwi(zone, date_debut, date_fin):
        """
        Median NDVI and NDWI (McFeeters) from Sentinel-2 SR.
        Filters cloud cover < 20%.
        Returns (ndvi, ndwi) floats.
        """
        try:
            collection = (
                ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                .filterBounds(zone)
                .filterDate(date_debut, date_fin)
                .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
            )
            median_img = collection.median()

            ndvi_img = median_img.normalizedDifference(["B8", "B4"]).rename("NDVI")
            # McFeeters NDWI for open water detection
            ndwi_img = median_img.normalizedDifference(["B3", "B8"]).rename("NDWI")

            ndvi_val = (
                ndvi_img
                .reduceRegion(
                    reducer=ee.Reducer.median(),
                    geometry=zone,
                    scale=100,
                    maxPixels=1e9
                )
                .get("NDVI")
                .getInfo()
            )
            ndwi_val = (
                ndwi_img
                .reduceRegion(
                    reducer=ee.Reducer.median(),
                    geometry=zone,
                    scale=100,
                    maxPixels=1e9
                )
                .get("NDWI")
                .getInfo()
            )

            ndvi_val = round(ndvi_val, 4) if ndvi_val is not None else None
            ndwi_val = round(ndwi_val, 4) if ndwi_val is not None else None
            return ndvi_val, ndwi_val
        except Exception as e:
            print(f"Error in _extract_ndvi_ndwi: {e}")
            return None, None

    @staticmethod
    def _extract_water_extent(zone, date_debut, date_fin):
        """
        Water surface extent from Sentinel-1 SAR (km²).
        FIX: rename water_mask band before pixelArea multiplication
        so the reducer key is predictable ('water').
        Threshold: VV < -16 dB → water pixel.
        """
        try:
            collection = (
                ee.ImageCollection("COPERNICUS/S1_GRD")
                .filterBounds(zone)
                .filterDate(date_debut, date_fin)
                .filter(ee.Filter.listContains(
                    "transmitterReceiverPolarisation", "VV"))
                .filter(ee.Filter.eq("instrumentMode", "IW"))
                .filter(ee.Filter.eq("orbitProperties_pass", "DESCENDING"))
                .select("VV")
            )
            median_img = collection.median()

            # FIX: rename before multiply so the band key is 'water'
            water_mask = median_img.lt(-16).rename("water")
            water_area_img = water_mask.multiply(ee.Image.pixelArea())

            water_area_sqm = (
                water_area_img
                .reduceRegion(
                    reducer=ee.Reducer.sum(),
                    geometry=zone,
                    scale=10,
                    maxPixels=1e9
                )
                .get("water")  # FIX: was 'VV', now 'water'
                .getInfo()
            )

            if water_area_sqm is not None:
                return round(water_area_sqm / 1e6, 2)  # m² → km²
            return None
        except Exception as e:
            print(f"Error in _extract_water_extent: {e}")
            return None

    # ─────────────────────────────────────────────────────────────────────────
    # ANALYSIS — MAIN ORCHESTRATOR
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    def run_analysis(zone_geometry, date_debut: str, date_fin: str):
        """
        Runs all 5 GEE extractions in parallel using ThreadPoolExecutor,
        computes the multi-criteria decision score, and returns the full result.
        """
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            future_gwsa = executor.submit(
                GEEService._extract_gwsa, zone_geometry, date_debut, date_fin)
            future_precip = executor.submit(
                GEEService._extract_precipitation, zone_geometry, date_debut, date_fin)
            future_et = executor.submit(
                GEEService._extract_et, zone_geometry, date_debut, date_fin)
            future_ndvi_ndwi = executor.submit(
                GEEService._extract_ndvi_ndwi, zone_geometry, date_debut, date_fin)
            future_water = executor.submit(
                GEEService._extract_water_extent, zone_geometry, date_debut, date_fin)

            gwsa             = future_gwsa.result()
            precip           = future_precip.result()
            et               = future_et.result()
            ndvi, ndwi       = future_ndvi_ndwi.result()
            water_extent_km2 = future_water.result()

        # Fallback to 0.0 if extraction failed
        gwsa             = gwsa             if gwsa             is not None else 0.0
        precip           = precip           if precip           is not None else 0.0
        et               = et               if et               is not None else 0.0
        ndvi             = ndvi             if ndvi             is not None else 0.0
        ndwi             = ndwi             if ndwi             is not None else 0.0
        water_extent_km2 = water_extent_km2 if water_extent_km2 is not None else 0.0

        climate_water_balance = round(precip - et, 2)

        # ── Multi-criteria scoring ────────────────────────────────────────────
        score = 0

        # Groundwater
        if gwsa < -15:
            score += 3
        elif gwsa < -5:
            score += 2

        # Climate water balance
        if climate_water_balance < 0:
            score += 2
        elif climate_water_balance < 50:
            score += 1

        # Land use pressure
        if ndvi > 0.6 and ndwi > 0.3:
            score += 2   # intensive irrigation detected
        elif ndvi > 0.4:
            score += 1   # moderate vegetation/usage

        # Surface water scarcity
        if water_extent_km2 < 50:
            score += 1

        # ── Classification ───────────────────────────────────────────────────
        if score >= 7:
            status = "CRITICAL"
            recommendation = "Crise hydrique sévère. Arrêt immédiat obligatoire."
        elif score >= 5:
            status = "PROHIBITED"
            recommendation = "Surexploitation détectée. Nouveaux forages interdits."
        elif score >= 3:
            status = "MODERATED"
            recommendation = "Stress modéré détecté. Quotas d'irrigation recommandés."
        else:
            status = "ALLOWED"
            recommendation = "Ressources en bon état. Utilisation normale autorisée."

        return {
            "groundwater": {
                "gwsa": gwsa,
                "precipitation": precip,
                "et": et,
                "climate_water_balance": climate_water_balance
            },
            "surface_water": {
                "water_extent_km2": water_extent_km2
            },
            "land_use": {
                "ndvi": ndvi,
                "ndwi": ndwi
            },
            "decision": {
                "score": score,
                "status": status,
                "recommendation": recommendation
            }
        }

    # ─────────────────────────────────────────────────────────────────────────
    # TIME SERIES
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    def get_timeseries(zone_geometry, date_debut: str, date_fin: str, dataset: str):
        """
        Returns monthly time series for a given dataset.
        FIX (GRACE): subtracts reference mean to return anomaly, not raw value.

        dataset options: "grace" | "chirps" | "ndvi"
        Returns: [{ "date": "2023-01", "value": float }, ...]
        """
        try:
            start  = ee.Date(date_debut)
            end    = ee.Date(date_fin)
            n_months = end.difference(start, "month").ceil()

            # Reference mean for GRACE anomaly (computed once, outside the map)
            grace_ref_mean = None
            if dataset == "grace":
                grace_ref_mean = (
                    ee.ImageCollection("NASA/GRACE/MASS_GRIDS_V04/MASCON_CRI")
                    .filterDate("2004-01-01", "2023-12-31")
                    .mean()
                    .select("lwe_thickness")
                    .reduceRegion(
                        reducer=ee.Reducer.mean(),
                        geometry=zone_geometry,
                        scale=5000,
                        maxPixels=1e9
                    )
                    .get("lwe_thickness")
                    .getInfo()
                )

            def get_monthly_value(month_offset):
                d1 = start.advance(month_offset, "month")
                d2 = d1.advance(1, "month")

                if dataset == "grace":
                    img = (
                        ee.ImageCollection("NASA/GRACE/MASS_GRIDS_V04/MASCON_CRI")
                        .filterDate(d1, d2)
                        .mean()
                        .select("lwe_thickness")
                    )
                    val = img.reduceRegion(
                        reducer=ee.Reducer.mean(),
                        geometry=zone_geometry,
                        scale=5000,
                        maxPixels=1e9
                    ).get("lwe_thickness").getInfo()
                    # FIX: subtract reference to return anomaly
                    if val is not None and grace_ref_mean is not None:
                        val = round(val - grace_ref_mean, 3)

                elif dataset == "chirps":
                    img = (
                        ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
                        .filterDate(d1, d2)
                        .sum()
                        .select("precipitation")
                    )
                    val = img.reduceRegion(
                        reducer=ee.Reducer.mean(),
                        geometry=zone_geometry,
                        scale=5000,
                        maxPixels=1e9
                    ).get("precipitation").getInfo()
                    if val is not None:
                        val = round(val, 2)

                elif dataset == "ndvi":
                    collection = (
                        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                        .filterBounds(zone_geometry)
                        .filterDate(d1, d2)
                        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
                    )
                    img = collection.median().normalizedDifference(
                        ["B8", "B4"]).rename("NDVI")
                    val = img.reduceRegion(
                        reducer=ee.Reducer.median(),
                        geometry=zone_geometry,
                        scale=100,
                        maxPixels=1e9
                    ).get("NDVI").getInfo()
                    if val is not None:
                        val = round(val, 4)

                else:
                    val = None

                return val

            # Build month labels
            n = int(n_months.getInfo())
            timeseries = []
            for i in range(n):
                d1 = start.advance(i, "month")
                label = d1.format("YYYY-MM").getInfo()
                value = get_monthly_value(i)
                if value is not None:
                    timeseries.append({"date": label, "value": value})

            return timeseries

        except Exception as e:
            print(f"Error in get_timeseries ({dataset}): {e}")
            return []