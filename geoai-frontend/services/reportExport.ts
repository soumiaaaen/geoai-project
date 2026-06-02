"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type ZoneSelection = Record<string, unknown> | null;

type BreakdownItem = {
  name: string;
  value: number;
  color: string;
};

type ReportData = {
  generatedAt: string;
  zoneSelection: ZoneSelection;
  dateDebut: string;
  dateFin: string;
  status: string;
  score: number;
  gw: {
    storageAnomaly: number;
    rechargeRate: number;
    trend: string;
    precip: number;
    tsGWSA: number[];
    tsRecharge: number[];
  };
  sw: {
    waterExtent: number;
    barrageLevel: number;
    precip: number;
    waterOccurrence: number;
    tsExtent: number[];
    tsPrecip: number[];
  };
  lu: {
    ndvi: number;
    ndwi: number;
    irrigationArea: number;
    croplandArea: number;
    breakdown: BreakdownItem[];
    tsNDVI: number[];
    tsNDWI: number[];
  };
  scoring: {
    gw: number;
    sw: number;
    lu: number;
    total: number;
  };
  months: string[];
};

const REPORT_SURFACE_STYLE = `
  width: 1100px;
  padding: 28px;
  background: #0f172a;
  color: #e2e8f0;
  font-family: Arial, sans-serif;
`;

const cardStyle = `
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 12px;
  background: #111827;
`;

function formatDateForFile(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}${m}${d}`;
}

function safeZoneSelectionToText(zoneSelection: ZoneSelection): string {
  if (!zoneSelection) return "Non spécifiée";
  try {
    return JSON.stringify(zoneSelection, null, 2);
  } catch {
    return "Zone sélectionnée (format non sérialisable)";
  }
}

function addSectionTitle(title: string): string {
  return `<h2 style="margin: 0 0 14px 0; font-size: 22px; color: #f8fafc;">${title}</h2>`;
}

function buildKpiGrid(items: Array<{ label: string; value: string; source?: string }>): string {
  return `
    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 14px;">
      ${items
        .map(
          (item) => `
          <div style="${cardStyle}">
            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px;">${item.label}</div>
            <div style="font-size: 20px; font-weight: 700; color: #22d3ee;">${item.value}</div>
            ${item.source ? `<div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">Source: ${item.source}</div>` : ""}
          </div>
        `,
        )
        .join("")}
    </div>
  `;
}

function buildSeriesTable(title: string, months: string[], values: number[]): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 820;
  const height = 160;
  const paddingLeft = 45;
  const paddingBottom = 25;
  const chartW = width - paddingLeft;
  const chartH = height - paddingBottom;

  const points = values
    .map((v, i) => {
      const x = paddingLeft + (i / Math.max(values.length - 1, 1)) * chartW;
      const y = chartH - ((v - min) / range) * (chartH - 10);
      return `${x},${y}`;
    })
    .join(" ");

  // Y-axis labels (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = min + (range * i) / 4;
    const y = chartH - ((val - min) / range) * (chartH - 10);
    return `
      <line x1="${paddingLeft - 4}" y1="${y}" x2="${paddingLeft}" y2="${y}" stroke="#475569" stroke-width="1"/>
      <text x="${paddingLeft - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#94a3b8">${val.toFixed(1)}</text>
    `;
  }).join("");

  // X-axis labels (months)
  const xLabels = months
    .map((m, i) => {
      const x = paddingLeft + (i / Math.max(months.length - 1, 1)) * chartW;
      return `<text x="${x}" y="${chartH + 18}" text-anchor="middle" font-size="10" fill="#94a3b8">${m}</text>`;
    })
    .join("");

  const rows = months
    .map((month, i) => `<tr><td style="padding: 6px; border: 1px solid #334155;">${month}</td><td style="padding: 6px; border: 1px solid #334155; text-align: right;">${values[i]}</td></tr>`)
    .join("");

  return `
    <div style="${cardStyle}; margin-bottom: 12px;">
      <div style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">${title}</div>
      <div style="margin-bottom: 10px; border: 1px solid #334155; border-radius: 6px; padding: 10px; background: #0b1220;">
        <svg viewBox="0 0 ${width} ${height + paddingBottom}" width="100%" xmlns="http://www.w3.org/2000/svg">
          <!-- Axes -->
          <line x1="${paddingLeft}" y1="0" x2="${paddingLeft}" y2="${chartH}" stroke="#475569" stroke-width="1"/>
          <line x1="${paddingLeft}" y1="${chartH}" x2="${width}" y2="${chartH}" stroke="#475569" stroke-width="1"/>
          <!-- Y ticks -->
          ${yTicks}
          <!-- X labels -->
          ${xLabels}
          <!-- Line -->
          <polyline fill="none" stroke="#22d3ee" stroke-width="2.5" points="${points}" />
        </svg>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr>
            <th style="padding: 6px; border: 1px solid #334155; text-align: left; color: #93c5fd;">Mois</th>
            <th style="padding: 6px; border: 1px solid #334155; text-align: right; color: #93c5fd;">Valeur</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}
function renderReportPages(data: ReportData): HTMLElement[] {
  const page1 = document.createElement("div");
  page1.style.cssText = REPORT_SURFACE_STYLE;
  page1.innerHTML = `
    ${addSectionTitle("Rapport HydroSight GeoAI - Complet")}
    <div style="${cardStyle}; margin-bottom: 14px;">
      <div style="font-size: 14px; margin-bottom: 10px;"><strong>Date d'export:</strong> ${data.generatedAt}</div>
      <div style="font-size: 14px; margin-bottom: 10px;"><strong>Période:</strong> ${data.dateDebut} -> ${data.dateFin}</div>
      <div style="font-size: 14px; margin-bottom: 10px;"><strong>Statut:</strong> ${data.status}</div>
      <div style="font-size: 14px;"><strong>Score:</strong> ${data.score}/10</div>
    </div>
    <div style="${cardStyle};">
      <div style="font-size: 13px; font-weight: 700; margin-bottom: 8px;">Zone sélectionnée</div>
      <pre style="margin: 0; white-space: pre-wrap; font-size: 11px; color: #cbd5e1;">${safeZoneSelectionToText(data.zoneSelection)}</pre>
    </div>
  `;

  const page2 = document.createElement("div");
  page2.style.cssText = REPORT_SURFACE_STYLE;
  page2.innerHTML = `
    ${addSectionTitle("Module 1 - Eaux Souterraines (GW)")}
    ${buildKpiGrid([
      { label: "Anomalie Souterraine", value: `${data.gw.storageAnomaly} cm`, source: "GRACE/NASA" },
      { label: "Bilan Hydrique (P-ET)", value: `${data.gw.rechargeRate} mm`, source: "GLDAS" },
      { label: "Tendance Niveau", value: data.gw.trend, source: "GRACE/NASA" },
      { label: "Précipitations", value: `${data.gw.precip} mm`, source: "CHIRPS" },
    ])}
    ${buildSeriesTable("Evolution GWSA", data.months, data.gw.tsGWSA)}
    ${buildSeriesTable("Bilan Hydrique Mensuel", data.months, data.gw.tsRecharge)}
  `;

  const page3 = document.createElement("div");
  page3.style.cssText = REPORT_SURFACE_STYLE;
  page3.innerHTML = `
    ${addSectionTitle("Module 2 - Eaux de Surface (SW)")}
    ${buildKpiGrid([
      { label: "Surface en Eau", value: `${data.sw.waterExtent} km²`, source: "Sentinel-1" },
      { label: "Niveau Barrages/Lacs", value: `${data.sw.barrageLevel} %`, source: "JRC Water" },
      { label: "Précipitations CHIRPS", value: `${data.sw.precip} mm`, source: "CHIRPS" },
      { label: "Eau Permanente", value: `${data.sw.waterOccurrence} %`, source: "JRC" },
    ])}
    ${buildSeriesTable("Etendue Surfaces en Eau", data.months, data.sw.tsExtent)}
    ${buildSeriesTable("Precipitations CHIRPS", data.months, data.sw.tsPrecip)}
  `;

  const page4 = document.createElement("div");
  page4.style.cssText = REPORT_SURFACE_STYLE;
  page4.innerHTML = `
    ${addSectionTitle("Module 3 - Occupation du Sol (LU)")}
    ${buildKpiGrid([
      { label: "NDVI Moyen", value: `${data.lu.ndvi}`, source: "Sentinel-2" },
      { label: "NDWI Moyen", value: `${data.lu.ndwi}`, source: "Sentinel-2" },
      { label: "Zone Irrigation", value: `${data.lu.irrigationArea} km²`, source: "ESA" },
      { label: "Surface Agricole", value: `${data.lu.croplandArea} km²`, source: "ESA" },
    ])}
    ${buildSeriesTable("NDVI Mensuel", data.months, data.lu.tsNDVI)}
    ${buildSeriesTable("NDWI Mensuel", data.months, data.lu.tsNDWI)}
    <div style="${cardStyle}; margin-bottom: 12px;">
      <div style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">Repartition Occupation Sol</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr>
            <th style="padding: 6px; border: 1px solid #334155; text-align: left; color: #93c5fd;">Classe</th>
            <th style="padding: 6px; border: 1px solid #334155; text-align: right; color: #93c5fd;">Valeur</th>
          </tr>
        </thead>
        <tbody>
          ${data.lu.breakdown
            .map(
              (item) => `
              <tr>
                <td style="padding: 6px; border: 1px solid #334155;">${item.name}</td>
                <td style="padding: 6px; border: 1px solid #334155; text-align: right;">${item.value}</td>
              </tr>
            `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
    <div style="${cardStyle}">
      <div style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">Score final</div>
      <div style="font-size: 13px; line-height: 1.8;">
        <div>GW: +${data.scoring.gw} pts</div>
        <div>SW: +${data.scoring.sw} pts</div>
        <div>LU: +${data.scoring.lu} pts</div>
        <div style="margin-top: 8px; font-weight: 700; color: #67e8f9;">Total: ${data.scoring.total}/10</div>
      </div>
    </div>
  `;

  return [page1, page2, page3, page4];
}

export async function exportFullPdf(data: ReportData): Promise<void> {
  const pages = renderReportPages(data);
  const stagingRoot = document.createElement("div");
  stagingRoot.style.position = "fixed";
  stagingRoot.style.left = "-99999px";
  stagingRoot.style.top = "0";
  stagingRoot.style.zIndex = "-1";
  document.body.appendChild(stagingRoot);

  try {
    pages.forEach((page) => stagingRoot.appendChild(page));
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const usableW = pageW - margin * 2;

    for (let i = 0; i < pages.length; i += 1) {
      const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true, backgroundColor: "#0f172a" });
      const imgData = canvas.toDataURL("image/png");
      const imgW = usableW;
      const imgH = (canvas.height * imgW) / canvas.width;
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, margin, imgW, imgH, undefined, "FAST");
    }

    const fileDate = formatDateForFile(new Date());
    pdf.save(`Rapport_HydroSight_Complet_${fileDate}.pdf`);
  } finally {
    document.body.removeChild(stagingRoot);
  }
}

function escapeXml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function rowsToWorksheetXml(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) return "<Worksheet><Table /></Worksheet>";
  const headers = Object.keys(rows[0]);
  const headerRow = `<Row>${headers.map((h) => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join("")}</Row>`;
  const bodyRows = rows
    .map((row) => {
      const cells = headers
        .map((h) => {
          const value = row[h];
          const isNumber = typeof value === "number" && Number.isFinite(value);
          const type = isNumber ? "Number" : "String";
          return `<Cell><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
        })
        .join("");
      return `<Row>${cells}</Row>`;
    })
    .join("");
  return `<Table>${headerRow}${bodyRows}</Table>`;
}

export function exportFullExcel(data: ReportData): void {
  const sheets: Array<{ name: string; rows: Array<Record<string, unknown>> }> = [
    {
      name: "Resume",
      rows: [
        {
          generatedAt: data.generatedAt,
          dateDebut: data.dateDebut,
          dateFin: data.dateFin,
          status: data.status,
          score: data.score,
          scoreGW: data.scoring.gw,
          scoreSW: data.scoring.sw,
          scoreLU: data.scoring.lu,
          scoreTotal: data.scoring.total,
          zoneSelection: safeZoneSelectionToText(data.zoneSelection),
        },
      ],
    },
    {
      name: "GW_Indicateurs",
      rows: [
        {
          storageAnomaly_cm: data.gw.storageAnomaly,
          rechargeRate_mm: data.gw.rechargeRate,
          trend: data.gw.trend,
          precip_mm: data.gw.precip,
        },
      ],
    },
    {
      name: "GW_Series",
      rows: data.months.map((month, i) => ({
        month,
        gwsa_cm: data.gw.tsGWSA[i],
        recharge_mm: data.gw.tsRecharge[i],
      })),
    },
    {
      name: "SW_Indicateurs",
      rows: [
        {
          waterExtent_km2: data.sw.waterExtent,
          barrageLevel_pct: data.sw.barrageLevel,
          precip_mm: data.sw.precip,
          waterOccurrence_pct: data.sw.waterOccurrence,
        },
      ],
    },
    {
      name: "SW_Series",
      rows: data.months.map((month, i) => ({
        month,
        extent_km2: data.sw.tsExtent[i],
        precip_mm: data.sw.tsPrecip[i],
      })),
    },
    {
      name: "LU_Indicateurs",
      rows: [
        {
          ndvi: data.lu.ndvi,
          ndwi: data.lu.ndwi,
          irrigationArea_km2: data.lu.irrigationArea,
          croplandArea_km2: data.lu.croplandArea,
        },
      ],
    },
    {
      name: "LU_Series",
      rows: data.months.map((month, i) => ({
        month,
        ndvi: data.lu.tsNDVI[i],
        ndwi: data.lu.tsNDWI[i],
      })),
    },
    {
      name: "LU_Breakdown",
      rows: data.lu.breakdown.map((item) => ({
        class: item.name,
        value: item.value,
        color: item.color,
      })),
    },
  ];

  const workbookXml = `<?xml version="1.0"?>
  <?mso-application progid="Excel.Sheet"?>
  <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel"
    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:html="http://www.w3.org/TR/REC-html40">
    ${sheets
      .map((sheet) => `<Worksheet ss:Name="${escapeXml(sheet.name)}">${rowsToWorksheetXml(sheet.rows)}</Worksheet>`)
      .join("")}
  </Workbook>`;

  const blob = new Blob([workbookXml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const fileDate = formatDateForFile(new Date());
  link.download = `Rapport_HydroSight_Complet_${fileDate}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
