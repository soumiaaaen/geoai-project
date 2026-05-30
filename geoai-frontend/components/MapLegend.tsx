"use client";

type MapLegendProps = {
  activeModule: string; // "gw" | "sw" | "lu"
};

export default function MapLegend({ activeModule }: MapLegendProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "30px",
        left: "10px",
        zIndex: 1000,
        background: "rgba(11, 17, 32, 0.92)",
        borderLeft: "3px solid #00C9B1",
        padding: "12px 14px",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "12px",
        color: "#F9FAFB",
        minWidth: "210px",
        pointerEvents: "none",
      }}
    >
      <div style={{ marginBottom: activeModule !== "" ? "12px" : "0" }}>
        <h4 style={{ margin: "0 0 8px 0", fontSize: "11px", fontWeight: "bold", letterSpacing: "0.5px", color: "#9CA3AF" }}>STATUT HYDRIQUE</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "12px", height: "12px", backgroundColor: "#10B981" }} />
            <span>ALLOWED — Ressources normales</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "12px", height: "12px", backgroundColor: "#F59E0B" }} />
            <span>MODERATED — Stress modéré</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "12px", height: "12px", backgroundColor: "#EF4444" }} />
            <span>PROHIBITED — Surexploitation</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "12px", height: "12px", backgroundColor: "#7F1D1D" }} />
            <span>CRITICAL — Crise sévère</span>
          </div>
        </div>
      </div>

      {activeModule === "lu" && (
        <>
          <div style={{ height: "1px", backgroundColor: "#374151", margin: "12px 0" }} />
          <div>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "11px", fontWeight: "bold", letterSpacing: "0.5px", color: "#9CA3AF" }}>OCCUPATION DU SOL</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", backgroundColor: "#006400" }} />
                <span>Forêt dense</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", backgroundColor: "#ffbb22" }} />
                <span>Arbustes</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", backgroundColor: "#f096ff" }} />
                <span>Lande herbacée</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", backgroundColor: "#fa0000" }} />
                <span>Terres cultivées</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", backgroundColor: "#b4b4b4" }} />
                <span>Zone urbanisée</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", backgroundColor: "#0096a0" }} />
                <span>Végétation éparse</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", backgroundColor: "#0064c8" }} />
                <span>Eau permanente</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", backgroundColor: "#fae6a0" }} />
                <span>Sol nu</span>
              </div>
            </div>
          </div>
        </>
      )}

      {activeModule === "gw" && (
        <>
          <div style={{ height: "1px", backgroundColor: "#374151", margin: "12px 0" }} />
          <div>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "11px", fontWeight: "bold", letterSpacing: "0.5px", color: "#9CA3AF" }}>ANOMALIE SOUTERRAINE (GWSA)</h4>
            <div style={{ background: "linear-gradient(to right, #EF4444, #F9FAFB, #3B82F6)", height: "8px", width: "100%", borderRadius: "4px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginTop: "4px", color: "#D1D5DB" }}>
              <span>Déficit (rouge)</span>
              <span>Neutre</span>
              <span>Surplus (bleu)</span>
            </div>
          </div>
        </>
      )}

      {activeModule === "sw" && (
        <>
          <div style={{ height: "1px", backgroundColor: "#374151", margin: "12px 0" }} />
          <div>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "11px", fontWeight: "bold", letterSpacing: "0.5px", color: "#9CA3AF" }}>SURFACES EN EAU</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", backgroundColor: "#3B82F6" }} />
                <span>Eau libre (Sentinel-1 VV &lt; -16 dB)</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
