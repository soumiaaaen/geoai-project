"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import hydrosightLogo from "../public/hydrosight-logo.png";

type HydroSightLogoProps = {
  href?: string;
  maxWidth?: number;
  priority?: boolean;
};

export default function HydroSightLogo({
  href,
  maxWidth = 180,
  priority = false,
}: HydroSightLogoProps) {
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

  const img = (
    <Image
      src={logoSrc}
      alt="HydroSight"
      width={maxWidth}
      height={Math.round(maxWidth * 0.44)}
      unoptimized
      priority={priority}
      style={{
        width: "100%",
        maxWidth,
        height: "auto",
        objectFit: "contain",
        display: "block",
      }}
    />
  );

  if (href) {
    return (
      <Link href={href} style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        {img}
      </Link>
    );
  }

  return img;
}
