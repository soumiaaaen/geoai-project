"use client";

import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { useState } from "react";

function ClickHandler({ setData }) {
  useMapEvents({
    click(e) {
      fetch("http://127.0.0.1:8000/ndvi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: e.latlng.lat,
          lon: e.latlng.lng,
        }),
      })
        .then(res => res.json())
        .then(data => {
          setData({
            lat: e.latlng.lat,
            lon: e.latlng.lng,
            ndvi: data.ndvi,
          });
        });
    },
  });

  return null;
}

export default function Map({ tileUrl }) {
  const [info, setInfo] = useState(null);

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <MapContainer
        center={[31.7917, -7.0926]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {tileUrl && <TileLayer url={tileUrl} />}

        <ClickHandler setData={setInfo} />
      </MapContainer>

      {info && (
        <div style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "white",
          padding: 10
        }}>
          <b>NDVI</b><br/>
          {info.ndvi}
        </div>
      )}
    </div>
  );
}