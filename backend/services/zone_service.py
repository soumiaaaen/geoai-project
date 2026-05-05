import ee
import requests

# GADM GeoJSON URLs (hosted publicly)
GADM_MOROCCO_L1 = "https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_MAR_1.json"
GADM_MOROCCO_L2 = "https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_MAR_2.json"
GADM_WS_L1     = "https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_ESH_1.json"
GADM_WS_L2     = "https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_ESH_2.json"


class ZoneService:

    @staticmethod
    def resolve_zone_geometry(zone_selection):
        granularity = zone_selection.granularite

        if granularity == "point":
            if zone_selection.lon is None or zone_selection.lat is None:
                raise ValueError("Point requires lat and lon")
            return ee.Geometry.Point(
                [zone_selection.lon, zone_selection.lat]
            ).buffer(5000)

        elif granularity == "bbox":
            if not zone_selection.bbox or len(zone_selection.bbox) != 4:
                raise ValueError("Bbox requires [minLon, minLat, maxLon, maxLat]")
            min_lon, min_lat, max_lon, max_lat = zone_selection.bbox
            return ee.Geometry.Rectangle([min_lon, min_lat, max_lon, max_lat])

        elif granularity == "province":
            if not zone_selection.code:
                raise ValueError("Province requires code (province name)")
            # Search in both Morocco and Western Sahara level2
            fc = ee.FeatureCollection("FAO/GAUL/2015/level2")
            result = fc.filter(
                ee.Filter.And(
                    ee.Filter.eq("ADM2_NAME", zone_selection.code),
                    ee.Filter.Or(
                        ee.Filter.eq("ADM0_NAME", "Morocco"),
                        ee.Filter.eq("ADM0_NAME", "Western Sahara")
                    )
                )
            )
            # If empty (Western Sahara province not in GAUL),
            # fall back to level1 (region)
            size = result.size().getInfo()
            if size == 0:
                print(f"Province '{zone_selection.code}' not in GAUL level2,"
                      f" trying level1...")
                fc1 = ee.FeatureCollection("FAO/GAUL/2015/level1")
                result = fc1.filter(
                    ee.Filter.And(
                        ee.Filter.eq("ADM1_NAME", zone_selection.code),
                        ee.Filter.Or(
                            ee.Filter.eq("ADM0_NAME", "Morocco"),
                            ee.Filter.eq("ADM0_NAME", "Western Sahara")
                        )
                    )
                )
            return result.geometry()

        elif granularity == "region":
            if not zone_selection.code:
                raise ValueError("Region requires code (region name)")
            regions = ee.FeatureCollection("FAO/GAUL/2015/level1")
            region = regions.filter(
                ee.Filter.And(
                    ee.Filter.eq("ADM1_NAME", zone_selection.code),
                    ee.Filter.Or(
                        ee.Filter.eq("ADM0_NAME", "Morocco"),
                        ee.Filter.eq("ADM0_NAME", "Western Sahara")
                    )
                )
            )
            return region.geometry()

        elif granularity == "national":
            countries = ee.FeatureCollection("FAO/GAUL/2015/level0")
            morocco = countries.filter(
                ee.Filter.Or(
                    ee.Filter.eq("ADM0_NAME", "Morocco"),
                    ee.Filter.eq("ADM0_NAME", "Western Sahara")
                )
            )
            return morocco.geometry()

        else:
            raise ValueError(f"Unknown granularity: {granularity}")

    @staticmethod
    def get_provinces_geojson():
        """
        Returns GeoJSON of all provinces (level2) for Morocco.
        For Western Sahara: GAUL has no level2, so we use level1
        regions as substitute and merge them in.
        """
        # Morocco provinces (level2) — GAUL has these
        morocco_provinces = ee.FeatureCollection("FAO/GAUL/2015/level2") \
            .filter(ee.Filter.eq("ADM0_NAME", "Morocco")) \
            .select(["ADM0_NAME", "ADM1_NAME", "ADM2_NAME"])

        # Western Sahara: no level2 in GAUL → use level1 as provinces
        # We rename ADM1_NAME → ADM2_NAME for consistency on the frontend
        ws_as_provinces = ee.FeatureCollection("FAO/GAUL/2015/level1") \
            .filter(ee.Filter.eq("ADM0_NAME", "Western Sahara")) \
            .map(lambda f: f.set("ADM2_NAME", f.get("ADM1_NAME"))) \
            .select(["ADM0_NAME", "ADM1_NAME", "ADM2_NAME"])

        # Merge both
        all_provinces = morocco_provinces.merge(ws_as_provinces)
        return all_provinces.getInfo()

    @staticmethod
    def get_regions_geojson():
        """
        Returns GeoJSON of all regions (level1) for Morocco
        and Western Sahara.
        """
        regions = ee.FeatureCollection("FAO/GAUL/2015/level1").filter(
            ee.Filter.Or(
                ee.Filter.eq("ADM0_NAME", "Morocco"),
                ee.Filter.eq("ADM0_NAME", "Western Sahara")
            )
        ).select(["ADM0_NAME", "ADM1_NAME"])

        return regions.getInfo()