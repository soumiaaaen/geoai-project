# 🌍 HydroSight — GeoAI Environmental Intelligence Platform

## Overview

HydroSight is a GeoAI web platform for real-time environmental monitoring and geospatial analysis using satellite imagery and artificial intelligence.

The platform combines:

* **Frontend:** Next.js + React + Leaflet
* **Backend:** FastAPI (Python)
* **Geo Processing:** Google Earth Engine (GEE)
* **Satellite Data:** Sentinel-2 imagery
* **Authentication:** Supabase Auth + JWT

HydroSight enables users to analyze environmental indicators directly from an interactive map interface through AI-powered geospatial workflows.

---

#  Main Features

##  Vegetation Monitoring (NDVI)

Analyze vegetation health using the Normalized Difference Vegetation Index (NDVI).

* Real-time NDVI computation
* Vegetation stress detection
* Time-series vegetation analysis
* Regional and national-scale monitoring

### NDVI Interpretation

* 🟢 High NDVI → Healthy vegetation
* 🟡 Medium NDVI → Sparse vegetation
* 🔴 Low NDVI → Dry land / desert areas

---

##  Surface Water Analysis

Monitor water bodies and hydrological changes over time.

* Surface water detection
* Water extent monitoring
* Drought observation
* Temporal water analysis

---

##  Groundwater Monitoring

Evaluate groundwater-related environmental indicators using geospatial analysis.

* Groundwater risk assessment
* Spatial suitability analysis
* Environmental scoring system
* AI-assisted interpretation

---

##  Land Use & Land Cover Classification

Analyze land occupation and land cover changes using satellite imagery.

* Urban area detection
* Agricultural land mapping
* Forest identification
* Bare soil classification
* Water body extraction

---

##  Interactive Geospatial Dashboard

HydroSight provides a modern interactive dashboard with:

* Interactive Leaflet map
* Point selection
* Bounding box (BBox) analysis
* Province and region selection
* National-scale analysis
* Real-time visualization

---

##  Time Series Analytics

Monitor environmental indicators across custom periods.

* NDVI evolution
* Water change monitoring
* Temporal environmental trends
* Dynamic chart visualization

---

##  Authentication & Security

The platform integrates secure authentication and protected routes.

* Supabase Authentication
* JWT-based sessions
* Public & protected routes
* Middleware route protection
* Role-ready architecture

---

#  AI & GeoAI Capabilities

HydroSight combines AI techniques with geospatial intelligence to provide:

* Environmental scoring
* Spatial analysis automation
* Satellite-based environmental insights
* Real-time geospatial computation

---

# 🏗️ Project Structure

```bash
hydrosight/
│
├── backend/                  # FastAPI Backend
│   ├── api/
│   ├── services/
│   ├── models/
│   ├── gee/
│   ├── auth/
│   └── main.py
│
├── frontend/                 # Next.js Frontend
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── middleware.ts
│   └── public/
│
└── README.md
```

---

# ⚙️ Installation & Setup

## Clone the Repository

```bash
git clone https://github.com/soumiaaaen/hydrosight.git
cd hydrosight
```

---

#  Backend Setup (FastAPI + Google Earth Engine)

```bash
cd backend

pip install fastapi uvicorn earthengine-api pydantic
```

## Authenticate Google Earth Engine

```bash
python -m ee.cli.eecli authenticate
```

## Run Backend Server

```bash
python -m uvicorn main:app --reload
```

Backend runs on:

```bash
http://localhost:8000
```

---

#  Frontend Setup (Next.js)

```bash
cd frontend

npm install
npm install leaflet react-leaflet
```

## Run Frontend

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:3000
```

---

#  API Endpoints

## Analyze Environmental Data

```http
POST /analyse
```

### Example Body

```json
{
  "zoneSelection": {
    "type": "point",
    "lat": 30.4,
    "lon": -9.6
  },
  "dateDebut": "2023-01-01",
  "dateFin": "2023-12-31"
}
```

---

## Resolve Geospatial Zones

```http
POST /zones/resolve
```

---

# 🛠️ Tech Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Leaflet
* React Leaflet

## Backend

* FastAPI
* Python
* Pydantic

## GeoAI & Data

* Google Earth Engine
* Sentinel-2 Imagery
* GeoJSON Processing

## Authentication

* Supabase Auth
* JWT Authentication

---

# 🚀 Future Improvements

* Advanced AI prediction models
* Climate risk forecasting
* NDWI integration
* Temperature analysis layers
* Satellite image export
* PDF report generation
* Kubernetes deployment
* CI/CD pipeline integration
* Performance optimization & caching

---

# 👨‍💻 Authors

GitHub:

* https://github.com/soumiaaaen
* https://github.com/Hali24-tech

---

#  Acknowledgments

* Google Earth Engine
* Sentinel-2 Satellite Data
* OpenStreetMap
* Leaflet
* FastAPI
* Next.js
