"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import hydrosightLogo from "../public/hydrosight-logo.png";

type SidebarProps = {
  activeMode: string;
  setActiveMode: (mode: string) => void;
  zoneSelection: any;
  dateDebut: string;
  setDateDebut: (d: string) => void;
  dateFin: string;
  setDateFin: (d: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
};

export default function Sidebar({
  activeMode,
  setActiveMode,
  zoneSelection,
  dateDebut,
  setDateDebut,
  dateFin,
  setDateFin,
  onAnalyze,
  isAnalyzing,
}: SidebarProps) {
  const [logoSrc, setLogoSrc] = useState(hydrosightLogo.src);

  useEffect(() => {
    const source = new window.Image();
    source.src = hydrosightLogo.src;
    source.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = source.width;
      canvas.height = source.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(source, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Remove near-black background so the logo stays visible in all themes.
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        if (r < 24 && g < 24 && b < 24) {
          pixels[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setLogoSrc(canvas.toDataURL("image/png"));
    };
  }, []);

  const modes = [
    { id: "point", label: "Point GPS" },
    { id: "bbox", label: "Bbox" },
    { id: "province", label: "Province" },
    { id: "region", label: "Région" },
    { id: "national", label: "National" },
  ];

  const isValidDate = new Date(dateFin) >= new Date(dateDebut);
  const canAnalyze = zoneSelection !== null && isValidDate && !isAnalyzing;

  return (
    <div
      style={{
        width: "280px",
        minWidth: "280px",
        height: "100vh",
        backgroundColor: "var(--panel-bg)",
        borderRight: "1px solid var(--border-color)",
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "28px",
        overflowY: "auto",
        boxShadow: "4px 0 15px rgba(0,0,0,0.2)",
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: "4px",
        }}
      >
        <Image
          src={logoSrc}
          alt="HydroSight logo"
          width={210}
          height={92}
          unoptimized
          priority
          style={{
            width: "100%",
            maxWidth: "210px",
            height: "auto",
            objectFit: "contain",
          }}
        />
      </div>

      <div>
        <h2 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
          1. Sélection de Zone
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: activeMode === mode.id ? "1px solid var(--accent-primary)" : "1px solid var(--border-color)",
                backgroundColor: activeMode === mode.id ? "rgba(0, 201, 177, 0.1)" : "transparent",
                color: activeMode === mode.id ? "var(--accent-primary)" : "#D1D5DB",
                cursor: "pointer",
                fontWeight: activeMode === mode.id ? "600" : "500",
                textAlign: "left",
                transition: "all 0.2s ease",
                boxShadow: activeMode === mode.id ? "0 0 10px rgba(0,201,177,0.1) inset" : "none"
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {zoneSelection && (
        <div style={{ padding: "14px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>Zone active</p>
          <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--foreground)", margin: "4px 0 0 0" }}>
            {zoneSelection.label || zoneSelection.granularite}
          </p>
        </div>
      )}

      <div>
        <h2 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
          2. Période d'Analyse
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "500" }}>
              Début
            </label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
                outline: "none",
                fontFamily: "inherit"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "500" }}>
              Fin
            </label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
                outline: "none",
                fontFamily: "inherit"
              }}
            />
          </div>
          {!isValidDate && (
            <p style={{ color: "#EF4444", fontSize: "12px", margin: 0, fontWeight: "500" }}>
              La date de fin doit être après la date de début.
            </p>
          )}
        </div>
      </div>

      <button
        onClick={onAnalyze}
        disabled={!canAnalyze}
        style={{
          marginTop: "auto",
          padding: "16px",
          background: canAnalyze ? "var(--btn-gradient)" : "var(--border-color)",
          color: canAnalyze ? "var(--btn-text)" : "var(--text-muted)",
          border: "none",
          borderRadius: "10px",
          fontSize: "15px",
          fontWeight: "700",
          cursor: canAnalyze ? "pointer" : "not-allowed",
          transition: "all 0.3s ease",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: canAnalyze ? "0 4px 15px rgba(0,201,177,0.3)" : "none",
          animation: canAnalyze && !isAnalyzing ? "pulse-glow 2s infinite" : "none"
        }}
      >
        {isAnalyzing ? (
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "16px", height: "16px", border: "2px solid #0B1120", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            Analyse...
          </span>
        ) : (
          "Lancer l'analyse spatiale"
        )}
      </button>
    </div>
  );
}
