"use client";

import Link from "next/link";
import { PLAN_LIMITS, PLAN_ORDER, type PlanId } from "@/lib/plans";
import { usePlan } from "@/hooks/usePlan";

const FEATURE_ROWS: { key: string; label: string; render: (p: PlanId) => string }[] = [
  {
    key: "modules",
    label: "Modules",
    render: (p) =>
      PLAN_LIMITS[p].modules.length === 3
        ? "GW + Surface + Sol"
        : "Occupation du sol",
  },
  {
    key: "modes",
    label: "Zones",
    render: (p) => PLAN_LIMITS[p].modes.join(", "),
  },
  {
    key: "bbox",
    label: "BBox max.",
    render: (p) =>
      PLAN_LIMITS[p].maxBBoxKm2 != null ? `${PLAN_LIMITS[p].maxBBoxKm2} km²` : "Illimité",
  },
  {
    key: "range",
    label: "Période max.",
    render: (p) =>
      PLAN_LIMITS[p].maxMonthsRange != null
        ? `${PLAN_LIMITS[p].maxMonthsRange} mois`
        : "Illimitée",
  },
  {
    key: "quota",
    label: "Analyses / mois",
    render: (p) => String(PLAN_LIMITS[p].analysesPerMonth),
  },
  {
    key: "pdf",
    label: "Export PDF",
    render: (p) => (PLAN_LIMITS[p].pdfExport ? "✓" : "—"),
  },
];

export default function PricingPage() {
  const { plan: currentPlan, loading } = usePlan();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#04080f",
        color: "#fff",
        fontFamily: "'Sora', sans-serif",
        padding: "48px 24px 80px",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48 }}>
          <Link href="/" style={{ color: "#38bdf8", textDecoration: "none", fontWeight: 600 }}>
            ← HydroSight
          </Link>
          <Link
            href="/dashboard"
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Tableau de bord
          </Link>
        </div>

        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ color: "#38bdf8", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Tarifs
          </p>
          <h1 style={{ fontSize: 42, fontWeight: 800, margin: "12px 0 16px", letterSpacing: "-0.03em" }}>
            Choisissez votre plan
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            Limites alignées sur le coût Earth Engine : zone, période et nombre d&apos;analyses.
            {!loading && (
              <span style={{ display: "block", marginTop: 8, color: "#7dd3fc" }}>
                Plan actuel : <strong>{PLAN_LIMITS[currentPlan].label}</strong>
              </span>
            )}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {PLAN_ORDER.map((planId) => {
            const p = PLAN_LIMITS[planId];
            const isCurrent = !loading && currentPlan === planId;
            const highlighted = planId === "pro";

            return (
              <div
                key={planId}
                style={{
                  padding: 28,
                  borderRadius: 20,
                  border: highlighted
                    ? "1px solid rgba(56,189,248,0.4)"
                    : "1px solid rgba(255,255,255,0.08)",
                  background: highlighted ? "rgba(14,165,233,0.08)" : "rgba(255,255,255,0.03)",
                  position: "relative",
                }}
              >
                {highlighted && (
                  <span
                    style={{
                      position: "absolute",
                      top: -10,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: 10,
                      fontWeight: 700,
                      background: "#0ea5e9",
                      padding: "4px 12px",
                      borderRadius: 20,
                    }}
                  >
                    POPULAIRE
                  </span>
                )}
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{p.label}</h2>
                <p style={{ fontSize: 28, fontWeight: 700, color: "#38bdf8", marginBottom: 24 }}>
                  {p.priceMonthly === 0 ? "Gratuit" : p.priceLabel}
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", fontSize: 14, lineHeight: 2 }}>
                  {FEATURE_ROWS.map((row) => (
                    <li key={row.key} style={{ color: "rgba(255,255,255,0.65)" }}>
                      <strong style={{ color: "rgba(255,255,255,0.9)" }}>{row.label}:</strong>{" "}
                      {row.render(planId)}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: 12,
                      borderRadius: 10,
                      border: "1px solid rgba(56,189,248,0.3)",
                      color: "#7dd3fc",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    Plan actuel
                  </div>
                ) : (
                  <button
                    type="button"
                    style={{
                      width: "100%",
                      textAlign: "center",
                      padding: 14,
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: highlighted
                        ? "linear-gradient(135deg,#0ea5e9,#6366f1)"
                        : "rgba(255,255,255,0.06)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                    onClick={() => {
                      window.location.href = `mailto:support@hydrosight.app?subject=Changement%20de%20plan%20-%20${p.label}`;
                    }}
                  >
                    Passer à ce plan
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p
          style={{
            marginTop: 40,
            textAlign: "center",
            fontSize: 13,
            color: "rgba(255,255,255,0.35)",
            lineHeight: 1.7,
          }}
        >
          En développement : mettez à jour{" "}
          <code style={{ color: "#7dd3fc" }}>profiles.plan</code> dans Supabase (
          <code>free</code>, <code>pro</code>, <code>premium</code>) pour tester les limites.
        </p>
      </div>
    </main>
  );
}
