"use client";

import Link from "next/link";

type GuestBannerProps = {
  analysesUsed: number;
  analysesLimit: number;
};

export default function GuestBanner({ analysesUsed, analysesLimit }: GuestBannerProps) {
  const remaining = Math.max(0, analysesLimit - analysesUsed);

  return (
    <div
      style={{
    position: "sticky", // Changed from "fixed"
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    flexWrap: "wrap",
    padding: "10px 20px",
    background: "linear-gradient(90deg, rgba(14,165,233,0.15), rgba(99,102,241,0.12))",
    borderBottom: "1px solid rgba(56,189,248,0.25)",
    backdropFilter: "blur(8px)", // Optional: makes it look premium over elements if scrolled
    fontSize: 13,
    color: "#e0f2fe",
  }}>
      <span>
        <strong>Mode démo</strong> — {remaining} analyse{remaining !== 1 ? "s" : ""} restante
        {remaining !== 1 ? "s" : ""} aujourd&apos;hui · point GPS · occupation du sol · 3 mois max.
      </span>
      <Link
        href="/register"
        style={{
          padding: "6px 14px",
          borderRadius: 8,
          background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
          color: "#fff",
          fontWeight: 600,
          textDecoration: "none",
          fontSize: 12,
        }}
      >
        Compte gratuit → 10 analyses/mois
      </Link>
      <Link href="/login" style={{ color: "#7dd3fc", fontSize: 12 }}>
        Déjà inscrit ?
      </Link>
    </div>
  );
}
