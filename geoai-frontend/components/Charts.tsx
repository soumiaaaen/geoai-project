"use client";

import React, { useState } from "react";
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from "recharts";
import { exportFullExcel, exportFullPdf } from "../services/reportExport";

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jui","Jul","Aoû","Sep","Oct","Nov","Déc"];

const MOCK = {
  status: "MODERATED", score: 3,
  gw: {
    storageAnomaly: -8.4, rechargeRate: -50.26, trend: "baisse", precip: 187.3,
    tsGWSA:    [-6.2,-7.1,-5.8,-6.9,-8.1,-9.4,-10.2,-11.0,-9.7,-8.4,-7.6,-8.4],
    tsRecharge:[12.3,-8.1,24.6,-15.2,-42.8,-89.4,-112.1,-98.7,-67.3,-12.4,8.7,-50.3]
  },
  sw: {
    waterExtent:342.7, barrageLevel:38.2, precip:23.4, waterOccurrence:12.3,
    tsExtent:  [420,398,445,412,380,342,298,276,310,355,378,342],
    tsPrecip:  [42,38,31,18,8,2,0,1,12,24,36,23]
  },
  lu: {
    ndvi:0.34, ndwi:0.09, irrigationArea:1240, croplandArea:8320,
    breakdown:[
      {name:"Sol nu",        value:187000, color:"#fae6a0"},
      {name:"Terres cult.",  value:83200,  color:"#fa0000"},
      {name:"Végét. éparse", value:95000,  color:"#0096a0"},
      {name:"Arbustes",      value:64000,  color:"#ffbb22"},
      {name:"Forêt dense",   value:42300,  color:"#006400"},
      {name:"Lande",         value:28000,  color:"#f096ff"},
      {name:"Zone urbaine",  value:12100,  color:"#b4b4b4"},
      {name:"Eau perm.",     value:3420,   color:"#0064c8"}
    ],
    tsNDVI: [0.18,0.22,0.31,0.41,0.48,0.38,0.28,0.24,0.29,0.35,0.32,0.34],
    tsNDWI: [0.14,0.16,0.18,0.21,0.15,0.09,0.05,0.04,0.07,0.10,0.12,0.09]
  },
  scoring: {gw:2, sw:1, lu:0, total:3}
};

const gwsaData = MONTHS.map((m, i) => ({ month: m, value: MOCK.gw.tsGWSA[i] }));
const rechargeData = MONTHS.map((m, i) => ({ month: m, value: MOCK.gw.tsRecharge[i] }));
const extentData = MONTHS.map((m, i) => ({ month: m, value: MOCK.sw.tsExtent[i] }));
const precipData = MONTHS.map((m, i) => ({ month: m, value: MOCK.sw.tsPrecip[i] }));
const ndviData = MONTHS.map((m, i) => ({ month: m, value: MOCK.lu.tsNDVI[i] }));
const ndwiData = MONTHS.map((m, i) => ({ month: m, value: MOCK.lu.tsNDWI[i] }));

function MetricCard({ title, value, color, source }: any) {
  return (
    <div style={{ background: "var(--glass-bg)", border: "1px solid var(--border-color)", borderTop: `3px solid ${color}`, padding: "14px", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", transition: "transform 0.2s" }}>
      <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" }}>{title}</div>
      <div style={{ fontSize: "20px", fontWeight: "700", color, margin: "8px 0 4px 0", textShadow: `0 0 10px ${color}40`, letterSpacing: "-0.5px" }}>{value}</div>
      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Source: {source}</div>
    </div>
  );
}

type ChartProps = {
  zoneSelection: any;
  dateDebut: string;
  dateFin: string;
  activeModule: string;
};

export default function Charts({ zoneSelection, dateDebut, dateFin, activeModule }: ChartProps) {
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const buildReportData = () => ({
    generatedAt: new Date().toLocaleString("fr-FR"),
    zoneSelection,
    dateDebut,
    dateFin,
    status: MOCK.status,
    score: MOCK.score,
    gw: MOCK.gw,
    sw: MOCK.sw,
    lu: MOCK.lu,
    scoring: MOCK.scoring,
    months: MONTHS,
  });

  const handleExportPDF = async () => {
    setExportingPDF(true);
    try {
      await exportFullPdf(buildReportData());
      alert("PDF téléchargé avec succès!");
    } catch (e) {
      alert("Erreur lors de la génération du PDF");
    } finally {
      setExportingPDF(false);
    }
  };

  const handleExportExcel = () => {
    setExportingExcel(true);
    try {
      exportFullExcel(buildReportData());
      alert("Excel téléchargé avec succès!");
    } catch (e) {
      alert("Erreur lors de la génération du fichier Excel");
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* TAB CONTENT: GW */}
      {activeModule === "gw" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn 200ms ease-in" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <MetricCard title="Anomalie Souterraine" value="-8.4 cm" color="#F59E0B" source="GRACE/NASA" />
            <MetricCard title="Bilan Hydrique (P−ET)" value="-50.3 mm" color="#EF4444" source="GLDAS" />
            <MetricCard title="Tendance Niveau" value="↓ Baisse" color="#EF4444" source="GRACE/NASA" />
            <MetricCard title="Précipitations" value="187.3 mm" color="#F59E0B" source="CHIRPS" />
          </div>

          <div>
            <h4 style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>Évolution GWSA (cm éq-eau)</h4>
            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer>
                <AreaChart data={gwsaData}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: "var(--text-muted)" }} width={30} />
                  <Tooltip contentStyle={{ background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "8px", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }} itemStyle={{ fontWeight: "600" }} />
                  <ReferenceLine y={0} stroke="white" strokeOpacity={0.4} strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="value" stroke="#00C9B1" fill="#00C9B1" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>Bilan Hydrique Mensuel (mm)</h4>
            <div style={{ width: "100%", height: 160 }}>
              <ResponsiveContainer>
                <BarChart data={rechargeData}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} width={30} />
                  <Tooltip contentStyle={{ background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "8px", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }} itemStyle={{ fontWeight: "600" }} />
                  <Bar dataKey="value">
                    {rechargeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value > 0 ? "#10B981" : "#EF4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SW */}
      {activeModule === "sw" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn 200ms ease-in" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <MetricCard title="Surface en Eau" value="342.7 km²" color="#F59E0B" source="Sentinel-1" />
            <MetricCard title="Niveau Barrages/Lacs" value="38.2 %" color="#F59E0B" source="JRC Water" />
            <MetricCard title="Précipitations CHIRPS" value="23.4 mm" color="#EF4444" source="CHIRPS" />
            <MetricCard title="Eau Permanente (JRC)" value="12.3 %" color="#F59E0B" source="JRC" />
          </div>

          <div>
            <h4 style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>Étendue Surfaces en Eau (km²)</h4>
            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer>
                <LineChart data={extentData}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} width={35} />
                  <Tooltip contentStyle={{ background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "8px", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }} itemStyle={{ fontWeight: "600" }} />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>Précipitations CHIRPS (mm/mois)</h4>
            <div style={{ width: "100%", height: 160 }}>
              <ResponsiveContainer>
                <BarChart data={precipData}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} width={30} />
                  <Tooltip contentStyle={{ background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "8px", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }} itemStyle={{ fontWeight: "600" }} />
                  <Bar dataKey="value" fill="#60A5FA" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LU */}
      {activeModule === "lu" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn 200ms ease-in" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <MetricCard title="NDVI Moyen" value="0.34" color="#F59E0B" source="Sentinel-2" />
            <MetricCard title="NDWI Moyen" value="0.09" color="#F59E0B" source="Sentinel-2" />
            <MetricCard title="Zone Irrigation" value="1 240 km²" color="#EF4444" source="ESA" />
            <MetricCard title="Surface Agricole ESA" value="8 320 km²" color="#F59E0B" source="ESA" />
          </div>

          <div>
            <h4 style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>Répartition Occupation Sol (km²)</h4>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart layout="vertical" data={MOCK.lu.breakdown} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <Tooltip contentStyle={{ background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "8px", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }} itemStyle={{ fontWeight: "600" }} />
                  <Bar dataKey="value">
                    {MOCK.lu.breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>NDVI Mensuel (Sentinel-2)</h4>
            <div style={{ width: "100%", height: 160 }}>
              <ResponsiveContainer>
                <LineChart data={ndviData}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: "var(--text-muted)" }} width={30} />
                  <ReferenceLine y={0.4} stroke="#F59E0B" strokeDasharray="3 3" />
                  <ReferenceLine y={0.6} stroke="#EF4444" strokeDasharray="3 3" />
                  <Tooltip contentStyle={{ background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "8px", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }} itemStyle={{ fontWeight: "600" }} />
                  <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>NDWI Mensuel (Sentinel-2)</h4>
            <div style={{ width: "100%", height: 160 }}>
              <ResponsiveContainer>
                <LineChart data={ndwiData}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} width={30} />
                  <ReferenceLine y={0.3} stroke="#F59E0B" strokeDasharray="3 3" />
                  <Tooltip contentStyle={{ background: "var(--panel-bg)", border: "1px solid var(--border-color)", borderRadius: "8px", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }} itemStyle={{ fontWeight: "600" }} />
                  <Line type="monotone" dataKey="value" stroke="#60A5FA" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* SCORING BREAKDOWN */}
      <div style={{ background: "var(--glass-bg)", border: "1px solid var(--border-color)", padding: "20px", borderRadius: "10px", marginTop: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <h4 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: "700", color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Décomposition du Score</h4>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
              <span>🌍 Eaux souterraines</span>
              <span>+2 pts</span>
            </div>
            <div style={{ width: "100%", height: "4px", backgroundColor: "#374151", borderRadius: "2px" }}>
              <div style={{ width: `${(2/4)*100}%`, height: "100%", backgroundColor: "#00C9B1", borderRadius: "2px" }} />
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
              <span>💧 Eaux de surface</span>
              <span>+1 pts</span>
            </div>
            <div style={{ width: "100%", height: "4px", backgroundColor: "#374151", borderRadius: "2px" }}>
              <div style={{ width: `${(1/4)*100}%`, height: "100%", backgroundColor: "#00C9B1", borderRadius: "2px" }} />
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
              <span>🌿 Occupation du sol</span>
              <span>+0 pts</span>
            </div>
            <div style={{ width: "100%", height: "4px", backgroundColor: "#374151", borderRadius: "2px" }}>
              <div style={{ width: `${(0/2)*100}%`, height: "100%", backgroundColor: "#00C9B1", borderRadius: "2px" }} />
            </div>
          </div>
        </div>
        
        <div style={{ borderTop: "1px solid #374151", marginTop: "12px", paddingTop: "12px", display: "flex", justifyContent: "space-between", color: "var(--foreground)", fontWeight: "bold", fontSize: "14px" }}>
          <span>Total:</span>
          <span>3 / 10</span>
        </div>
      </div>

      {/* EXPORT BUTTONS */}
      <div style={{ display: "flex", gap: "10px", marginTop: "10px", paddingBottom: "20px" }}>
        <button
          onClick={handleExportPDF}
          disabled={exportingPDF || exportingExcel}
          style={{
            flex: 1, padding: "8px", background: "transparent", border: "1px solid #00C9B1", color: "#00C9B1", borderRadius: "4px", fontSize: "13px", fontWeight: "bold", cursor: exportingPDF || exportingExcel ? "not-allowed" : "pointer", transition: "all 0.2s", opacity: exportingPDF || exportingExcel ? 0.65 : 1
          }}
          onMouseOver={(e) => {
            if (!(exportingPDF || exportingExcel)) {
              e.currentTarget.style.backgroundColor = "#00C9B1";
              e.currentTarget.style.color = "white";
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#00C9B1";
          }}
        >
          {exportingPDF ? "Génération..." : "📄 Exporter PDF"}
        </button>
        <button
          onClick={handleExportExcel}
          disabled={exportingPDF || exportingExcel}
          style={{
            flex: 1, padding: "8px", background: "transparent", border: "1px solid #00C9B1", color: "#00C9B1", borderRadius: "4px", fontSize: "13px", fontWeight: "bold", cursor: exportingPDF || exportingExcel ? "not-allowed" : "pointer", transition: "all 0.2s", opacity: exportingPDF || exportingExcel ? 0.65 : 1
          }}
          onMouseOver={(e) => {
            if (!(exportingPDF || exportingExcel)) {
              e.currentTarget.style.backgroundColor = "#00C9B1";
              e.currentTarget.style.color = "white";
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#00C9B1";
          }}
        >
          {exportingExcel ? "Génération..." : "📊 Exporter Excel"}
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
