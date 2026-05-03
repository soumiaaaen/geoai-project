import ee

class GEEService:

    @staticmethod
    def get_ndvi(lat, lon, scale=30):

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

    @staticmethod
    def get_morocco_geometry():

        countries = ee.FeatureCollection("FAO/GAUL/2015/level0")

        morocco = countries.filter(
            ee.Filter.Or(
                ee.Filter.eq("ADM0_NAME", "Morocco"),
                ee.Filter.eq("ADM0_NAME", "Western Sahara")
            )
        )

        return morocco.geometry()

    @staticmethod
    def get_ndvi_map():

        region = GEEService.get_morocco_geometry()

        image = (
            ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
            .filterBounds(region)
            .filterDate("2024-01-01", "2024-12-31")
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