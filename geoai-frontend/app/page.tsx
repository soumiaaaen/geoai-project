"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
});

export default function Home() {
  const [tileUrl, setTileUrl] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/ndvi-map")
      .then(res => res.json())
      .then(data => setTileUrl(data.tile_url));
  }, []);

  return <Map tileUrl={tileUrl} />;
}