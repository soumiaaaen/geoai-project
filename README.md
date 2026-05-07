# 🌍 GeoAI Platform — NDVI Monitoring System

## Overview

This project is a **GeoAI web platform** that uses satellite data to analyze vegetation health in real time.

It combines:

*  **Frontend**: Next.js + Leaflet (interactive map)
*  **Backend**: FastAPI (API layer)
*  **Data Source**: Google Earth Engine (Sentinel-2 imagery)

 The system allows users to:

* Visualize NDVI (vegetation index) over Morocco 🇲🇦
* Interact with a map
* Click anywhere to get vegetation health values

---

## What is NDVI?

NDVI (Normalized Difference Vegetation Index) is a key indicator used in remote sensing:

* 🟢 High NDVI → healthy vegetation
* 🟡 Medium NDVI → sparse vegetation
* 🔴 Low NDVI → dry land / desert

---

##  Project Structure

```
geoai-project/
│
├── backend/              # FastAPI + GEE
│   ├── main.py
│   ├── api/
│   ├── services/
│   ├── models/
│   └── gee/
│
├── geoai-frontend/       # Next.js + Leaflet
│   ├── app/
│   ├── components/
│   └── package.json
│
└── README.md
```

---

##  Installation & Setup

### 1️ Clone the repository

```bash
git clone https://github.com/soumiaaaen/geoai-project.git
cd geoai-project
```

---

## 🔧 Backend Setup (FastAPI + GEE)

```bash
cd backend
pip install fastapi uvicorn earthengine-api pydantic
```

### Authenticate Google Earth Engine

```bash
python -m ee.cli.eecli authenticate
```

### Run backend

```bash
python -m uvicorn main:app --reload
```



---

## 🌐 Frontend Setup (Next.js)

```bash
cd geoai-frontend
npm install
npm install leaflet react-leaflet
npm run dev
```

---

##  Features

###  NDVI Map

* Displays satellite-based vegetation index
* Covers Morocco + Western Sahara

###  Interactive Click

* Click anywhere on the map
* Get NDVI value instantly

###  Satellite Data

* Source: Sentinel-2 (via Google Earth Engine)

---

##  API Endpoints

###  Get NDVI at a point

```http
POST /ndvi
```

**Body:**

```json
{
  "lat": 30.4,
  "lon": -9.6
}
```

---

### 🗺 Get NDVI map tiles

```http
GET /ndvi-map
```

---

##  Tech Stack

* **Frontend:** Next.js, React, Leaflet
* **Backend:** FastAPI, Python
* **Geo Processing:** Google Earth Engine
* **Satellite Data:** Sentinel-2

---

##  Future Improvements

*  NDVI time series analysis
*  Add NDWI (water index)
*  Add temperature layers
*  Improve performance with caching
*  Better UI/UX

---

##  Author

* GitHub:
* https://github.com/soumiaaaen
* https://github.com/Hali24-tech

---

##  Acknowledgments

* Google Earth Engine
* OpenStreetMap
* Sentinel-2 Data
