"use client";

import Link from "next/link";

type UpgradeModalProps = {
  message: string;
  onClose: () => void;
  isGuest?: boolean;
};

export default function UpgradeModal({ message, onClose, isGuest }: UpgradeModalProps) {
  return (
    <div
      role="dialog"
      aria-modal
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          padding: 28,
          borderRadius: 16,
          background: "var(--panel-bg, #111827)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 12px", fontSize: 18, color: "var(--foreground)" }}>
          {isGuest ? "Limite du mode démo" : "Limite du plan atteinte"}
        </h3>
        <p style={{ margin: "0 0 20px", fontSize: 14, lineHeight: 1.6, color: "var(--text-muted)" }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href={isGuest ? "/register" : "/pricing"}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "12px 16px",
              borderRadius: 8,
              background: "var(--btn-gradient, linear-gradient(135deg,#00C9B1,#0284c7))",
              color: "var(--btn-text, #0b1120)",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            {isGuest ? "Créer un compte gratuit" : "Voir les offres"}
          </Link>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid var(--border-color)",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
