"""
Génère un PDF listant les jeux de données Earth Engine par module (GeoAI).
Exécuter depuis la racine du projet : python scripts/generate_datasets_pdf.py
"""
from __future__ import annotations

import sys
from datetime import date
from pathlib import Path

from fpdf import FPDF


def _arial_path() -> str | None:
    """Police système Windows pour UTF-8 (accents français)."""
    candidates = [
        Path(r"C:\Windows\Fonts\arial.ttf"),
        Path(r"C:\Windows\Fonts\Arial.ttf"),
    ]
    for p in candidates:
        if p.is_file():
            return str(p)
    return None


class Doc(FPDF):
    def footer(self) -> None:
        self.set_y(-15)
        self.set_font("DocFont", "", 9)
        self.set_text_color(100, 100, 100)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")


def main() -> int:
    font_file = _arial_path()
    if not font_file:
        print("Erreur: Arial introuvable (Windows Fonts). Installez Arial ou modifiez le script.", file=sys.stderr)
        return 1

    out_dir = Path(__file__).resolve().parent.parent / "docs"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "datasets-par-module-gee.pdf"

    pdf = Doc()
    pdf.set_margins(15, 15, 15)
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_font("DocFont", "", font_file)
    bold_path = Path(font_file).parent / "arialbd.ttf"
    pdf.add_font("DocFont", "B", str(bold_path) if bold_path.is_file() else font_file)

    pdf.add_page()
    pdf.set_font("DocFont", "B", 16)
    w = pdf.epw
    pdf.multi_cell(w, 10, "Jeux de données Earth Engine - GeoAI (par module)")
    pdf.ln(2)
    pdf.set_font("DocFont", "", 10)
    pdf.set_text_color(80, 80, 80)
    pdf.multi_cell(
        w,
        6,
        "Document généré automatiquement. Les URL pointent vers le catalogue officiel "
        "Google Earth Engine (remplacement des '/' par '_' dans le chemin du dataset).",
    )
    pdf.multi_cell(w, 6, f"Date : {date.today().isoformat()}")
    pdf.set_text_color(0, 0, 0)
    pdf.ln(6)

    sections: list[tuple[str, list[tuple[str, str, str]]]] = [
        (
            "Module Eaux souterraines (GW)",
            [
                (
                    "Anomalie de stockage (GRACE Mascon CRI)",
                    "NASA/GRACE/MASS_GRIDS_V04/MASCON_CRI",
                    "https://developers.google.com/earth-engine/datasets/catalog/NASA_GRACE_MASS_GRIDS_V04_MASCON_CRI",
                ),
                (
                    "Précipitations (quotidien)",
                    "UCSB-CHG/CHIRPS/DAILY",
                    "https://developers.google.com/earth-engine/datasets/catalog/UCSB-CHG_CHIRPS_DAILY",
                ),
                (
                    "Évapotranspiration (pour bilan P-ET)",
                    "MODIS/061/MOD16A2",
                    "https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MOD16A2",
                ),
            ],
        ),
        (
            "Module Eaux de surface (SW)",
            [
                (
                    "Étendue en eau (Sentinel-1 SAR)",
                    "COPERNICUS/S1_GRD",
                    "https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S1_GRD",
                ),
                (
                    "Carte eau de surface (occurrence) — tuiles carte",
                    "JRC/GSW1_4/GlobalSurfaceWater",
                    "https://developers.google.com/earth-engine/datasets/catalog/JRC_GSW1_4_GlobalSurfaceWater",
                ),
            ],
        ),
        (
            "Module Occupation du sol (LU)",
            [
                (
                    "NDVI / NDWI (Sentinel-2 SR harmonisé)",
                    "COPERNICUS/S2_SR_HARMONIZED",
                    "https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_SR_HARMONIZED",
                ),
                (
                    "Occupation du sol (carte)",
                    "ESA/WorldCover/v200/2021",
                    "https://developers.google.com/earth-engine/datasets/catalog/ESA_WorldCover_v200_2021",
                ),
            ],
        ),
        (
            "Annexes — limites administratives",
            [
                (
                    "GAUL niveau pays",
                    "FAO/GAUL/2015/level0",
                    "https://developers.google.com/earth-engine/datasets/catalog/FAO_GAUL_2015_level0",
                ),
                (
                    "GAUL niveau régions",
                    "FAO/GAUL/2015/level1",
                    "https://developers.google.com/earth-engine/datasets/catalog/FAO_GAUL_2015_level1",
                ),
                (
                    "GAUL niveau provinces",
                    "FAO/GAUL/2015/level2",
                    "https://developers.google.com/earth-engine/datasets/catalog/FAO_GAUL_2015_level2",
                ),
            ],
        ),
    ]

    pdf.set_font("DocFont", "", 11)
    pdf.multi_cell(
        w,
        6,
        "Note : le bilan climatique P-ET n'est pas un dataset séparé ; il est calculé dans le backend à partir "
        "de CHIRPS et MOD16 (ET).",
    )
    pdf.ln(4)

    for title, rows in sections:
        pdf.set_font("DocFont", "B", 13)
        pdf.multi_cell(w, 9, title)
        pdf.set_font("DocFont", "", 10)
        pdf.set_fill_color(245, 245, 245)
        for label, ee_id, url in rows:
            pdf.ln(2)
            pdf.multi_cell(w, 6, f"- {label}")
            pdf.set_font("DocFont", "", 9)
            pdf.set_text_color(40, 40, 40)
            pdf.multi_cell(w, 5, f"  ID Earth Engine : {ee_id}")
            pdf.set_text_color(0, 51, 153)
            pdf.multi_cell(w, 5, f"  Lien : {url}")
            pdf.set_text_color(0, 0, 0)
            pdf.set_font("DocFont", "", 10)
        pdf.ln(6)

    pdf.output(str(out_path))
    print(str(out_path))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
