"use client";

import { MapContainer, TileLayer, useMapEvents, useMap, GeoJSON } from "react-leaflet";
import { useState, useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import MapLegend from "./MapLegend";

/* 🌍 Land use labels */
const landClasses: Record<number, string> = {
  10: "Forest 🌳",
  20: "Shrubland 🌿",
  30: "Grassland 🌱",
  40: "Cropland 🌾",
  50: "Urban 🏙️",
  60: "Bare land 🏜️",
  70: "Snow ❄️",
  80: "Water 🌊",
};

function ClickHandler({ setInfo, activeModule, activeMode, setZoneSelection }: any) {
  useMapEvents({
    click(e) {
      if (activeMode === "point") {
        setZoneSelection({
          granularite: "point",
          lat: e.latlng.lat,
          lon: e.latlng.lng,
          label: `Point (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`,
        });
        return;
      }

      if (activeMode !== "point" && activeMode !== "bbox" && activeMode !== "province" && activeMode !== "region" && activeMode !== "national") {
        // Handle info clicks
        const endpoint =
          activeModule === "lu"
            ? "http://127.0.0.1:8000/landcover-point"
            : "http://127.0.0.1:8000/ndvi";

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
            if (activeModule !== "lu") {
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
      }
    },
  });
  return null;
}

function DrawControl({ activeMode, setZoneSelection }: any) {
  const map = useMap();
  const drawControlRef = useRef<any>(null);
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());

  useEffect(() => {
    map.addLayer(drawnItemsRef.current);
    return () => {
      map.removeLayer(drawnItemsRef.current);
    };
  }, [map]);

  useEffect(() => {
    if (activeMode === "bbox") {
      const drawControl = new L.Control.Draw({
        draw: {
          polyline: false,
          polygon: false,
          circle: false,
          marker: false,
          circlemarker: false,
          rectangle: true,
        },
        edit: {
          featureGroup: drawnItemsRef.current,
        },
      });
      map.addControl(drawControl);
      drawControlRef.current = drawControl;

      const onDrawCreated = (e: any) => {
        drawnItemsRef.current.clearLayers();
        const layer = e.layer;
        drawnItemsRef.current.addLayer(layer);
        const bounds = layer.getBounds();
        setZoneSelection({
          granularite: "bbox",
          bbox: [
            bounds.getWest(),
            bounds.getSouth(),
            bounds.getEast(),
            bounds.getNorth(),
          ],
          label: `BBox (${bounds.getWest().toFixed(2)}, ${bounds.getSouth().toFixed(2)}, ...)`,
        });
      };

      map.on(L.Draw.Event.CREATED, onDrawCreated);

      return () => {
        map.removeControl(drawControl);
        map.off(L.Draw.Event.CREATED, onDrawCreated);
      };
    } else {
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      }
      drawnItemsRef.current.clearLayers();
    }
  }, [map, activeMode, setZoneSelection]);

  return null;
}

type MapProps = {
  activeMode: string;
  setZoneSelection: (zone: any) => void;
  analysisStatus: string | null;
  resolvedGeojson: any | null;
  activeModule: string;
};

export default function Map({ activeMode, setZoneSelection, analysisStatus, resolvedGeojson, activeModule }: MapProps) {
  const [info, setInfo] = useState<any>(null);

  const [ndviUrl, setNdviUrl] = useState<string | null>(null);
  const [landUseUrl, setLandUseUrl] = useState<string | null>(null);
  const [gwsaUrl, setGwsaUrl] = useState<string | null>(null);
  const [waterExtentUrl, setWaterExtentUrl] = useState<string | null>(null);

  const [provincesGeojson, setProvincesGeojson] = useState<any>(null);
  const [regionsGeojson, setRegionsGeojson] = useState<any>(null);

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

  /* 💧 GWSA map */
  useEffect(() => {
    fetch("http://127.0.0.1:8000/gwsa-map")
      .then(res => res.json())
      .then(data => setGwsaUrl(data.tile_url))
      .catch(err => console.log("GWSA ERROR (endpoint not ready):", err));
  }, []);

  /* 🌊 Water extent map */
  useEffect(() => {
    fetch("http://127.0.0.1:8000/water-extent-map")
      .then(res => res.json())
      .then(data => setWaterExtentUrl(data.tile_url))
      .catch(err => console.log("Water extent ERROR (endpoint not ready):", err));
  }, []);

  /* Load Provinces & Regions */
  useEffect(() => {
    if (activeMode === "province" && !provincesGeojson) {
      fetch("http://127.0.0.1:8000/zones/provinces")
        .then(res => res.json())
        .then(data => setProvincesGeojson(data))
        .catch(err => console.error(err));
    }
    if (activeMode === "region" && !regionsGeojson) {
      fetch("http://127.0.0.1:8000/zones/regions")
        .then(res => res.json())
        .then(data => setRegionsGeojson(data))
        .catch(err => console.error(err));
    }
    
    if (activeMode === "national") {
       setZoneSelection({
         granularite: "national",
         label: "Tout le Maroc",
       });
    }
  }, [activeMode]);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "ALLOWED": return "#22c55e"; // green
      case "MODERATED": return "#f59e0b"; // yellow/orange
      case "PROHIBITED": return "#ef4444"; // red
      case "CRITICAL": return "#991b1b"; // dark red
      default: return "#3b82f6"; // default blue
    }
  };

  const onProvinceClick = (feature: any) => {
    if (activeMode === "province") {
      let name = feature.properties.ADM2_NAME;
      if (name === "Administrative unit not available" || !name) {
        name = feature.properties.ADM1_NAME;
      }
      setZoneSelection({
        granularite: "province",
        code: name,
        label: name,
      });
    }
  };

  const onRegionClick = (feature: any) => {
    if (activeMode === "region") {
      setZoneSelection({
        granularite: "region",
        code: feature.properties.ADM1_NAME,
        label: feature.properties.ADM1_NAME,
      });
    }
  };

  const mapKey = useMemo(() => "map-" + Math.random(), []);

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>

      <MapContainer
        key={mapKey}
        center={[31.7917, -7.0926]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {activeModule === "lu" && ndviUrl && <TileLayer url={ndviUrl} />}
        {activeModule === "lu" && landUseUrl && <TileLayer url={landUseUrl} />}
        
        {activeModule === "gw" && gwsaUrl && <TileLayer url={gwsaUrl} />}
        {activeModule === "sw" && waterExtentUrl && <TileLayer url={waterExtentUrl} />}

        <ClickHandler setInfo={setInfo} activeModule={activeModule} activeMode={activeMode} setZoneSelection={setZoneSelection} />
        
        <DrawControl activeMode={activeMode} setZoneSelection={setZoneSelection} />

        {activeMode === "province" && provincesGeojson && (
          <GeoJSON
            data={provincesGeojson}
            style={{ color: "#6b7280", weight: 1, fillOpacity: 0.2 }}
            onEachFeature={(feature, layer) => {
              layer.on({
                click: () => onProvinceClick(feature),
                mouseover: (e) => {
                   const l = e.target;
                   l.setStyle({ weight: 2, color: '#3b82f6', fillOpacity: 0.5 });
                },
                mouseout: (e) => {
                   const l = e.target;
                   l.setStyle({ weight: 1, color: '#6b7280', fillOpacity: 0.2 });
                }
              });
            }}
          />
        )}

        {activeMode === "region" && regionsGeojson && (
          <GeoJSON
            data={regionsGeojson}
            style={{ color: "#4b5563", weight: 2, fillOpacity: 0.1 }}
            onEachFeature={(feature, layer) => {
              layer.on({
                click: () => onRegionClick(feature),
                mouseover: (e) => {
                   const l = e.target;
                   l.setStyle({ weight: 3, color: '#3b82f6', fillOpacity: 0.4 });
                },
                mouseout: (e) => {
                   const l = e.target;
                   l.setStyle({ weight: 2, color: '#4b5563', fillOpacity: 0.1 });
                }
              });
            }}
          />
        )}

        {resolvedGeojson && (
           <GeoJSON 
             key={JSON.stringify(resolvedGeojson) + (analysisStatus || "")}
             data={resolvedGeojson} 
             style={{ 
               color: getStatusColor(analysisStatus), 
               weight: 3, 
               fillOpacity: 0.4,
               fillColor: getStatusColor(analysisStatus)
             }} 
           />
        )}
      </MapContainer>

      <MapLegend activeModule={activeModule} />

      {info && activeMode !== "point" && activeMode !== "bbox" && activeMode !== "province" && activeMode !== "region" && activeMode !== "national" && (
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "white",
            padding: 10,
            borderRadius: 8,
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            zIndex: 1000
          }}
        >
          {info.type === "ndvi" ? (
            <>
              <b>NDVI</b><br />
              Lat: {info.lat.toFixed(4)}<br />
              Lon: {info.lon.toFixed(4)}<br />
              Value: {info.value}
            </>
          ) : (
            <>
              <b>Land Use</b><br />
              Lat: {info.lat.toFixed(4)}<br />
              Lon: {info.lon.toFixed(4)}<br />
              Class: {info.label}<br />
              Code: {info.value}
            </>
          )}
        </div>
      )}
    </div>
  );
}