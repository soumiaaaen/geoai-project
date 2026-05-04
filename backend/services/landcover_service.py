import ee

class LandCoverService:

    @staticmethod
    def get_landcover_map():

        # ✅ correct ESA WorldCover dataset
        image = ee.Image("ESA/WorldCover/v200/2021").select("Map")

        # Morocco bounds
        morocco = ee.Geometry.Rectangle([-17, 20, -1, 36])

        image = image.clip(morocco)

        vis_params = {
            "min": 10,
            "max": 100,
            "palette": [
                "#006400",  # forest
                "#ffbb22",  # shrubland
                "#ffff4c",  # cropland
                "#f096ff",  # built-up
                "#fa0000",  # bare land
                "#0064c8",  # water
            ]
        }

        map_id = image.getMapId(vis_params)

        return {
            "tile_url": map_id["tile_fetcher"].url_format
        }