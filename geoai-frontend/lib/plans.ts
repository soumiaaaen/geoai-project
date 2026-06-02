export type PlanId = "guest" | "free" | "pro" | "premium";

export type QuotaPeriod = "day" | "month";

export type PlanLimits = {
  label: string;
  priceMonthly: number | null;
  priceLabel: string;
  modules: ("gw" | "sw" | "lu")[];
  modes: string[];
  maxBBoxKm2: number | null;
  maxMonthsRange: number | null;
  analysesPerMonth: number;
  analysesPerDay?: number;
  quotaPeriod: QuotaPeriod;
  pdfExport: boolean;
  excelExport: boolean;
  whiteLabel: boolean;
};

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  guest: {
    label: "Démo",
    priceMonthly: 0,
    priceLabel: "Sans compte",
    modules: ["lu"],
    modes: ["point"],
    maxBBoxKm2: 0,
    maxMonthsRange: 3,
    analysesPerMonth: 0,
    analysesPerDay: 2,
    quotaPeriod: "day",
    pdfExport: false,
    excelExport: false,
    whiteLabel: false,
  },
  free: {
    label: "Free",
    priceMonthly: 0,
    priceLabel: "Gratuit",
    modules: ["lu"],
    modes: ["point", "bbox"],
    maxBBoxKm2: 25,
    maxMonthsRange: 6,
    analysesPerMonth: 10,
    quotaPeriod: "month",
    pdfExport: false,
    excelExport: false,
    whiteLabel: false,
  },
  pro: {
    label: "Pro",
    priceMonthly: 39,
    priceLabel: "39 €/mois",
    modules: ["gw", "sw", "lu"],
    modes: ["point", "bbox", "province"],
    maxBBoxKm2: null,
    maxMonthsRange: 36,
    analysesPerMonth: 100,
    quotaPeriod: "month",
    pdfExport: true,
    excelExport: true,
    whiteLabel: false,
  },
  premium: {
    label: "Premium",
    priceMonthly: 129,
    priceLabel: "129 €/mois",
    modules: ["gw", "sw", "lu"],
    modes: ["point", "bbox", "province", "region", "national"],
    maxMonthsRange: null,
    maxBBoxKm2: null,
    analysesPerMonth: 500,
    quotaPeriod: "month",
    pdfExport: true,
    excelExport: true,
    whiteLabel: true,
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "premium"];

export function normalizePlan(plan: string | null | undefined): PlanId {
  if (plan === "guest" || plan === "pro" || plan === "premium") return plan;
  return "free";
}

export function isGuestPlan(plan: string | null | undefined): boolean {
  return plan === "guest";
}

export function getQuotaLimit(limits: PlanLimits): number {
  if (limits.quotaPeriod === "day" && limits.analysesPerDay != null) {
    return limits.analysesPerDay;
  }
  return limits.analysesPerMonth;
}

export function getQuotaLabel(plan: PlanId): string {
  const limits = PLAN_LIMITS[plan];
  if (limits.quotaPeriod === "day") {
    return `${limits.analysesPerDay ?? 0} / jour`;
  }
  return `${limits.analysesPerMonth} / mois`;
}

export function getLimits(plan: string | null | undefined): PlanLimits {
  return PLAN_LIMITS[normalizePlan(plan)];
}

export function monthsBetween(dateDebut: string, dateFin: string): number {
  const start = new Date(dateDebut);
  const end = new Date(dateFin);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1
  );
}

export function bboxAreaKm2(bbox: number[]): number | null {
  if (!bbox || bbox.length !== 4) return null;
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const latMid = ((minLat + maxLat) / 2) * (Math.PI / 180);
  const widthKm = Math.abs(maxLon - minLon) * 111.32 * Math.cos(latMid);
  const heightKm = Math.abs(maxLat - minLat) * 110.574;
  return widthKm * heightKm;
}

export type PlanCheckInput = {
  plan: string | null | undefined;
  activeModule: string;
  activeMode: string;
  dateDebut: string;
  dateFin: string;
  bbox?: number[] | null;
  analysesUsed: number;
};

export function checkPlanAccess(input: PlanCheckInput): { ok: true } | { ok: false; message: string } {
  const limits = getLimits(input.plan);

  if (!limits.modules.includes(input.activeModule as "gw" | "sw" | "lu")) {
    return {
      ok: false,
      message: `Le module n'est pas inclus dans le plan ${limits.label}. Passez à Pro pour tous les modules.`,
    };
  }

  if (!limits.modes.includes(input.activeMode)) {
    return {
      ok: false,
      message: `Le mode « ${input.activeMode} » nécessite un plan supérieur (${limits.label} → Pro ou Premium).`,
    };
  }

  if (limits.maxMonthsRange != null) {
    const months = monthsBetween(input.dateDebut, input.dateFin);
    if (months > limits.maxMonthsRange) {
      return {
        ok: false,
        message: `Période max. ${limits.maxMonthsRange} mois sur le plan ${limits.label}. Réduisez la plage ou passez à Pro.`,
      };
    }
  }

  if (input.activeMode === "bbox") {
    if (limits.maxBBoxKm2 === 0) {
      return {
        ok: false,
        message: "Le mode Bbox nécessite un compte gratuit. Créez un compte pour continuer.",
      };
    }
    if (limits.maxBBoxKm2 != null && input.bbox) {
      const area = bboxAreaKm2(input.bbox);
      if (area != null && area > limits.maxBBoxKm2) {
        return {
          ok: false,
          message: `BBox trop grande (${area.toFixed(1)} km², max ${limits.maxBBoxKm2} km² sur Free).`,
        };
      }
    }
  }

  const quotaLimit = getQuotaLimit(limits);
  if (input.analysesUsed >= quotaLimit) {
    const periodLabel = limits.quotaPeriod === "day" ? "aujourd'hui" : "ce mois-ci";
    const signupHint =
      input.plan === "guest"
        ? " Créez un compte gratuit pour 10 analyses/mois et la sélection Bbox."
        : " Passez à un plan supérieur.";
    return {
      ok: false,
      message: `Quota atteint (${quotaLimit} analyses ${periodLabel}).${signupHint}`,
    };
  }

  return { ok: true };
}

export function currentUtcDay(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function currentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
