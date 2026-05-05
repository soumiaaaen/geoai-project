"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Charts from "@/components/Charts";
import { api } from "@/services/api";
import "leaflet/dist/leaflet.css";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  const [activeModule, setActiveModule] = useState("gw"); // "gw" | "sw" | "lu"
  const [activeMode, setActiveMode] = useState("point");
  const [zoneSelection, setZoneSelection] = useState<any>(null);
  const [dateDebut, setDateDebut] = useState("2023-01-01");
  const [dateFin, setDateFin] = useState("2023-12-31");
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [resolvedGeojson, setResolvedGeojson] = useState<any>(null);
  const [analyzedParams, setAnalyzedParams] = useState<any>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleAnalyze = async () => {
    if (!zoneSelection) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalyzedParams(null);

    try {
      // 1. Resolve geometry
      const resolved = await api.post("/zones/resolve", zoneSelection);
      setResolvedGeojson(resolved.geojson);

      // 2. Run analysis
      const result = await api.post("/analyse", {
        zoneSelection,
        dateDebut,
        dateFin
      });
      setAnalysisResult(result);
      setAnalyzedParams({ zoneSelection, dateDebut, dateFin });
      
    } catch (err) {
      console.error("Analysis failed", err);
      alert("Une erreur s'est produite lors de l'analyse.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ALLOWED": return "#22c55e";
      case "MODERATED": return "#f59e0b";
      case "PROHIBITED": return "#ef4444";
      case "CRITICAL": return "#991b1b";
      default: return "#374151";
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "sans-serif" }}>
      
      {/* Left Sidebar */}
      <Sidebar
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        zoneSelection={zoneSelection}
        dateDebut={dateDebut}
        setDateDebut={setDateDebut}
        dateFin={dateFin}
        setDateFin={setDateFin}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
      />

      {/* Main Content Area (Map + Right Panel) */}
      <div style={{ display: "flex", flexDirection: "row", flexGrow: 1, overflow: "hidden" }}>
          
          {/* Main Map Area */}
          <div style={{ flexGrow: 1, position: "relative" }}>
            
            {/* Floating Module Tabs & Theme Toggle */}
            <div style={{ position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 1000, display: "flex", gap: "10px", flexWrap: "nowrap", whiteSpace: "nowrap", alignItems: "center" }}>
              {[
                { id: "gw", label: "💧 Eaux Souterraines" },
                { id: "sw", label: "🌊 Eaux de Surface" },
                { id: "lu", label: "🌿 Occupation du Sol" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveModule(tab.id)}
                  style={{
                    padding: "10px 16px",
                    fontSize: "14px",
                    fontWeight: "600",
                    borderRadius: "30px",
                    border: "1px solid",
                    borderColor: activeModule === tab.id ? "var(--accent-primary)" : "var(--glass-border)",
                    background: activeModule === tab.id ? "rgba(0, 201, 177, 0.15)" : "var(--glass-bg)",
                    backdropFilter: "blur(8px)",
                    color: activeModule === tab.id ? "var(--accent-primary)" : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: activeModule === tab.id ? "0 0 15px rgba(0, 201, 177, 0.2)" : "0 4px 6px rgba(0,0,0,0.1)"
                  }}
                >
                  {tab.label}
                </button>
              ))}

              {/* Theme Toggle Button */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={{
                  padding: "10px",
                  borderRadius: "50%",
                  border: "1px solid var(--glass-border)",
                  background: "var(--glass-bg)",
                  backdropFilter: "blur(8px)",
                  color: "var(--foreground)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  marginLeft: "8px",
                  transition: "all 0.3s ease"
                }}
                title={`Passer en mode ${theme === "dark" ? "clair" : "sombre"}`}
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
            </div>

            {/* Floating Decision Status (Always visible if analyzed) */}
            {analysisResult && (
              <div style={{ position: "absolute", top: "80px", left: "50%", transform: "translateX(-50%)", zIndex: 1000, width: "auto", minWidth: "500px", padding: "14px 20px", borderRadius: "12px", backgroundColor: getStatusColor(analysisResult.decision.status), color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>
                    STATUT : {analysisResult.decision.status}
                  </h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: "14px", opacity: 0.95, fontWeight: "500" }}>
                    {analysisResult.decision.recommendation}
                  </p>
                </div>
                <div style={{ fontSize: "18px", fontWeight: "800", backgroundColor: "rgba(0,0,0,0.2)", padding: "6px 16px", borderRadius: "6px" }}>
                  Score: {analysisResult.decision.score}/10
                </div>
              </div>
            )}

            <Map 
              activeMode={activeMode} 
              setZoneSelection={setZoneSelection} 
              analysisStatus={analysisResult?.decision?.status || null}
              resolvedGeojson={resolvedGeojson}
              activeModule={activeModule}
            />
          </div>

          {/* Right Panel */}
          <div 
            style={{ 
              width: "350px", 
              minWidth: "350px",
              height: "100%", 
              backgroundColor: "var(--panel-bg)", 
              borderLeft: "1px solid var(--border-color)",
              padding: "24px 20px",
              overflowY: "auto",
              boxShadow: "-4px 0 15px rgba(0,0,0,0.2)",
              zIndex: 10,
              scrollbarWidth: "thin",
              scrollbarColor: "#374151 var(--panel-bg)"
            }}
          >
            {!analysisResult && !isAnalyzing && (
              <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#9CA3AF", padding: "20px" }}>
                <p style={{ lineHeight: "1.6" }}>Sélectionnez une zone et lancez l'analyse pour voir les indicateurs détaillés du module <strong style={{ color: "var(--foreground)" }}>{activeModule === "gw" ? "Eaux Souterraines" : activeModule === "sw" ? "Eaux de Surface" : "Occupation du Sol"}</strong>.</p>
              </div>
            )}

            {isAnalyzing && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", marginTop: "40px" }}>
                <div style={{ width: "40px", height: "40px", border: "4px solid var(--border-color)", borderTop: "4px solid var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <p style={{ color: "var(--accent-primary)", fontWeight: "600", letterSpacing: "0.5px" }}>Calcul en cours...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {analysisResult && analyzedParams && (
              <Charts 
                zoneSelection={analyzedParams.zoneSelection} 
                dateDebut={analyzedParams.dateDebut} 
                dateFin={analyzedParams.dateFin}
                activeModule={activeModule}
              />
            )}
          </div>
      </div>

    </div>
  );
}