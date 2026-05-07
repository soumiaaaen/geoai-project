# 🌍 GeoAI Platform — Geospatial Intelligence System

## 📌 Overview

GeoAI is a full-stack geospatial intelligence platform that analyzes environmental conditions using satellite imagery and AI-powered spatial analytics.

It goes beyond simple NDVI visualization and provides multi-layer Earth observation analysis including vegetation, water resources, and land use classification.

### 🧩 Stack
- Frontend: Next.js + Leaflet (interactive GIS dashboard)
- Backend: FastAPI (REST API + geospatial processing)
- Geo Data: Google Earth Engine (Sentinel-2 imagery)

---

## 🎯 What the system does

GeoAI enables users to:

- 🗺 Visualize environmental data on an interactive map
- 🌿 Monitor vegetation health (NDVI analysis)
- 🏙 Perform land use / land cover classification
- 💧 Analyze surface water bodies and changes over time
- 🌊 Monitor groundwater-related indicators (hydrogeological analysis)
- 📍 Select any zone (point, bbox, region, national scale)
- 📊 Get AI-powered environmental insights in real time

---

## 🧠 Core Modules

### 🌿 1. Vegetation Monitoring (NDVI)
- Computes NDVI from Sentinel-2 imagery
- Tracks vegetation health over time
- Detects drought and vegetation stress

🟢 Healthy vegetation  
🟡 Moderate vegetation  
🔴 Dry / barren land  

---

### 🏙 2. Land Use / Land Cover Classification
- Automatically classifies terrain into:
  - Urban areas
  - Agriculture
  - Forests
  - Bare soil
  - Water bodies
- Used for urban expansion and environmental monitoring

---

### 💧 3. Surface Water Monitoring
- Detects rivers, lakes, reservoirs
- Tracks seasonal and temporal changes
- Useful for drought and water resource analysis

---

### 🌊 4. Groundwater Analysis
- Hydro-geospatial indicators for underground water zones
- Helps identify potential groundwater stress regions
- Supports environmental planning and sustainability studies

---

## 🏗 Project Structure

geoai-project/
│
├── backend/              # FastAPI + Google Earth Engine
│   ├── main.py
│   ├── api/
│   ├── services/
│   ├── models/
│   └── gee/
│
├── geoai-frontend/       # Next.js + Leaflet GIS dashboard
│   ├── app/
│   ├── components/
│   └── package.json
│
└── README.md

---

## ⚙️ Installation & Setup

### 1️⃣ Clone repository

git clone https://github.com/soumiaaaen/geoai-project.git
cd geoai-project

---

## 🔧 Backend Setup (FastAPI + GEE)

cd backend
pip install fastapi uvicorn earthengine-api pydantic

### Authenticate Google Earth Engine

python -m ee.cli.eecli authenticate

### Run backend

uvicorn main:app --reload

---

## 🌐 Frontend Setup (Next.js)

cd geoai-frontend
npm install
npm install leaflet react-leaflet
npm run dev

---

## ✨ Features

### 🗺 Interactive GIS Map
- Leaflet-based map interface
- Zone selection: point, bbox, region, country
- Real-time spatial analysis

---

### 🧠 AI Geospatial Engine
- FastAPI backend processing
- Google Earth Engine integration
- Multi-layer environmental analysis

---

### 📊 Environmental Analytics
- NDVI vegetation index
- Land use classification
- Surface water detection
- Groundwater indicators
- Temporal and spatial insights

---

## 🔌 API Endpoints

### 🌿 NDVI Analysis

POST /ndvi

```json
{
  "lat": 30.4,
  "lon": -9.6
}
