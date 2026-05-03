import ee

def initialize_gee():
    ee.Initialize(project="pfa-2a-gl")
    print("GEE initialized successfully")