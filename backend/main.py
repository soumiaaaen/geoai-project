from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from gee.client import initialize_gee
from api.routes import router

app = FastAPI(title="GeoAI GEE Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

initialize_gee()

app.include_router(router)

@app.get("/")
def home():
    return {"message": "GeoAI backend running 🚀"}