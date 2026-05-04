"use client";

import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";

/* 🌍 Land use labels */
const landClasses = {
  10: "Forest 🌳",
  20: "Shrubland 🌿",
  30: "Grassland 🌱",
  40: "Cropland 🌾",
  50: "Urban 🏙️",
  60: "Bare land 🏜️",
  70: "Snow ❄️",
  80: "Water 🌊",
};

/* 📍 Click handler */
function ClickHandler({ setInfo, activeLayer }) {
  useMapEvents({
    click(e) {
      const endpoint =
        activeLayer === "ndvi"
          ? "http://127.0.0.1:8000/ndvi"
          : "http://127.0.0.1:8000/landcover-point";

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: e.latlng.lat,
          lon: e.latlng.lng,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (activeLayer === "ndvi") {
            setInfo({
              type: "ndvi",
              lat: e.latlng.lat,
              lon: e.latlng.lng,
              value: data.ndvi ?? "No data",
            });
          } else {
            const code = data.landcover;

            setInfo({
              type: "landuse",
              lat: e.latlng.lat,
              lon: e.latlng.lng,
              value: code ?? "No data",
              label: landClasses[code] || "Unknown",
            });
          }
        })
        .catch(err => console.error("CLICK ERROR:", err));
    },
  });

  return null;
}

export default function Map() {
  const [info, setInfo] = useState(null);
  const [activeLayer, setActiveLayer] = useState("ndvi");

  const [ndviUrl, setNdviUrl] = useState(null);
  const [landUseUrl, setLandUseUrl] = useState(null);

  /* 🌿 NDVI map */
  useEffect(() => {
    fetch("http://127.0.0.1:8000/ndvi-map")
      .then(res => res.json())
      .then(data => setNdviUrl(data.tile_url))
      .catch(err => console.error("NDVI ERROR:", err));
  }, []);

  /* 🏙️ Land use map */
  useEffect(() => {
    fetch("http://127.0.0.1:8000/landcover-map")
      .then(res => res.json())
      .then(data => setLandUseUrl(data.tile_url))
      .catch(err => console.error("LAND ERROR:", err));
  }, []);

  return (
    <div style={{ height: "100vh", position: "relative" }}>

     {/* 🧭 Layer Switcher (Bottom Left) */}
<div
  style={{
    position: "absolute",
    bottom: 20,
    left: 20,
    zIndex: 1000,
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(10px)",
    padding: "8px",
    borderRadius: "14px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    display: "flex",
    gap: "6px",
  }}
>
  {/* NDVI Button */}
  <button
    onClick={() => setActiveLayer("ndvi")}
    style={{
      padding: "8px 14px",
      borderRadius: "10px",
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "13px",
      background: activeLayer === "ndvi" ? "#16a34a" : "transparent",
      color: activeLayer === "ndvi" ? "white" : "#16a34a",
      transition: "all 0.2s ease",
    }}
  >
     NDVI
  </button>

  {/* Land Use Button */}
  <button
    onClick={() => setActiveLayer("landuse")}
    style={{
      padding: "8px 14px",
      borderRadius: "10px",
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "13px",
      background: activeLayer === "landuse" ? "#1d4ed8" : "transparent",
      color: activeLayer === "landuse" ? "white" : "#1d4ed8",
      transition: "all 0.2s ease",
    }}
  >
     Land Use
  </button>
</div>

      {/* 🗺️ MAP */}
      <MapContainer
        center={[31.7917, -7.0926]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
      >
        {/* Base map */}
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* NDVI */}
        {activeLayer === "ndvi" && ndviUrl && (
          <TileLayer url={ndviUrl} />
        )}

        {/* Land Use */}
        {activeLayer === "landuse" && landUseUrl && (
          <TileLayer url={landUseUrl} />
        )}

        {/* Click handler */}
        <ClickHandler setInfo={setInfo} activeLayer={activeLayer} />
      </MapContainer>

      {/* 📊 Info panel */}
      {info && (
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "white",
            padding: 10,
            borderRadius: 8,
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}
        >
          {info.type === "ndvi" ? (
            <>
              <b>NDVI</b>
              <br />
              Lat: {info.lat.toFixed(4)}
              <br />
              Lon: {info.lon.toFixed(4)}
              <br />
              Value: {info.value}
            </>
          ) : (
            <>
              <b>Land Use</b>
              <br />
              Lat: {info.lat.toFixed(4)}
              <br />
              Lon: {info.lon.toFixed(4)}
              <br />
              Class: {info.label}
              <br />
              Code: {info.value}
            </>
          )}
        </div>
      )}
    </div>
  );
}