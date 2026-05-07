"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import hydrosightLogo from "@/public/hydrosight-logo.png";
import Image from "next/image";

const faqs = [
  {
    q: "What satellite data does GeoAI use?",
    a: "GeoAI uses Sentinel-2 imagery via Google Earth Engine, providing high-resolution multispectral data updated every 5 days globally.",
  },
  {
    q: "What geographic scales are supported?",
    a: "From a single point to national scale — you can select a point, draw a bounding box, pick a province/region, or run country-wide analysis.",
  },
  {
    q: "How is the AI analysis performed?",
    a: "The backend (FastAPI + GEE) computes indices like NDVI and runs land cover classification in real time, returning results directly to your interactive map.",
  },
  {
    q: "Is authentication required?",
    a: "Yes. The platform uses JWT-based authentication with role-based access control (user/admin) for secure API communication.",
  },
  {
    q: "Can I run time series analysis?",
    a: "Absolutely. You can monitor any environmental indicator over a custom time period and view temporal trends in the dashboard charts.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen w-full bg-[#070B14] text-white overflow-x-hidden">

      {/* NAVBAR */}
      <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-white/5 sticky top-0 z-50 bg-[#070B14]/90 backdrop-blur-md">
        <Image
            src={hydrosightLogo}
            alt="hydrosight"
            width={160}
            height={60}
          />
        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how" className="hover:text-white transition">How it works</a>
          <a href="#tech" className="hover:text-white transition">Tech Stack</a>
          <a href="#usecases" className="hover:text-white transition">Use Cases</a>
          <a href="#faq" className="hover:text-white transition">FAQ</a>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <button onClick={() => router.push("/login")} className="text-gray-300 hover:text-white transition">
            Login
          </button>
          <button
            onClick={() => router.push("/register")}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative flex flex-col items-center text-center px-6 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 flex justify-center pointer-events-none">
          <div className="w-[700px] h-[700px] bg-blue-500/15 blur-[140px] rounded-full mt-[-100px]" />
        </div>

        <span className="z-10 text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5 text-gray-300">
          🚀 Powered by Google Earth Engine
        </span>

        <h1 className="z-10 mt-6 text-5xl md:text-6xl font-bold leading-tight max-w-4xl">
          Earth Intelligence for{" "}
          <span className="text-blue-400">Climate & Environment</span>
        </h1>

        <p className="z-10 mt-6 text-gray-300 max-w-2xl text-lg">
          Monitor vegetation health, land use changes, water bodies, and environmental risks
          using real-time satellite data and AI-powered geospatial analytics.
        </p>

        <div className="z-10 mt-10 flex gap-4 flex-wrap justify-center">
          <button
            onClick={() => router.push("/register")}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-600/20"
          >
            register
          </button>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 rounded-xl border border-white/15 hover:border-white/30 transition"
          >
            Sign In
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 md:px-12 py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-blue-400 text-xs uppercase tracking-widest text-center mb-3">Capabilities</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-4">
            Built for Environmental Intelligence
          </h2>
          <p className="text-gray-400 text-center max-w-xl mx-auto mb-14 text-sm">
            A full suite of geospatial analysis tools powered by Sentinel-2 satellite imagery and Google Earth Engine.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                icon: "🌿",
                title: "Vegetation Monitoring (NDVI)",
                desc: "Real-time NDVI computation from Sentinel-2 imagery. Detect vegetation health, stress levels, and seasonal change across any zone — from a single field to an entire region.",
              },
              {
                icon: "🏙️",
                title: "Land Use Classification",
                desc: "AI-powered automatic land cover classification into forest, cropland, urban areas, bare soil, and water bodies — with spatial visualization on the interactive map.",
              },
              {
                icon: "💧",
                title: "Water & Climate Analysis",
                desc: "Monitor water extent changes, hydrological indicators, and drought-related metrics. Track surface water dynamics over time with temporal charting.",
              },
              {
                icon: "🗺️",
                title: "Interactive Map Interface",
                desc: "Leaflet-based map with point selection, bounding box drawing, province/region picker, and national-scale analysis — all in a responsive React dashboard.",
              },
              {
                icon: "📊",
                title: "Time Series Analysis",
                desc: "Temporal monitoring of any environmental indicator over custom date ranges. Spot long-term trends, seasonal patterns, and anomalies with interactive charts.",
              },
              {
                icon: "🔐",
                title: "Secure Authentication",
                desc: "JWT-based authentication with role-based access control (user/admin). Secure API communication between frontend and backend for enterprise-ready deployment.",
              },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-2xl bg-white/4 border border-white/8 hover:border-blue-500/30 transition">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{f.icon}</span>
                  <div>
                    <h3 className="font-semibold text-base mb-1">{f.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="px-6 md:px-12 py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-blue-400 text-xs uppercase tracking-widest text-center mb-3">Workflow</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-14">
            How it works
          </h2>

          <div className="grid md:grid-cols-3 gap-6 text-center relative">
            {[
              { step: "01", title: "Select a Zone", desc: "Pick a point, draw a bounding box, or select a province / country on the interactive map." },
              { step: "02", title: "Run Analysis", desc: "Choose your indicator — NDVI, land cover, water extent — and trigger real-time GEE computation." },
              { step: "03", title: "Get AI Insights", desc: "Receive visualized results, time series charts, and AI-powered environmental interpretation." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section id="tech" className="px-6 md:px-12 py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-blue-400 text-xs uppercase tracking-widest text-center mb-3">Architecture</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-14">
            Tech Stack
          </h2>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                label: "Frontend",
                items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Leaflet (maps)", "REST API integration"],
              },
              {
                label: "Backend",
                items: ["FastAPI (Python)", "Google Earth Engine", "NDVI & land cover services", "Zone management API", "JWT / Passlib / bcrypt", "GeoJSON handling"],
              },
              {
                label: "Data & Security",
                items: ["Sentinel-2 imagery (GEE)", "10m spatial resolution", "5-day revisit cycle", "JWT authentication", "Role-based access control", "Secure REST APIs"],
              },
            ].map((col) => (
              <div key={col.label} className="p-6 rounded-2xl bg-white/4 border border-white/8">
                <h3 className="text-blue-400 font-semibold mb-4 text-sm uppercase tracking-wide">{col.label}</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  {col.items.map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section id="usecases" className="px-6 md:px-12 py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-blue-400 text-xs uppercase tracking-widest text-center mb-3">Applications</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-14">
            Who is it for?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "🌱", title: "Agriculture & Farming", desc: "Track crop health and vegetation stress across growing seasons to optimize yield." },
              { icon: "🌊", title: "Water Resource Management", desc: "Monitor surface water extent and drought indicators for resource planning." },
              { icon: "🏛️", title: "Government & Policy", desc: "Evidence-based decision support for land use regulation and environmental policy." },
              { icon: "🔬", title: "Research & Academia", desc: "Time series datasets and geospatial analysis tools for scientific study." },
              { icon: "🌳", title: "Conservation", desc: "Detect deforestation, habitat change, and biodiversity-risk zones over time." },
              { icon: "📈", title: "Sustainable Development", desc: "Monitor and report on environmental impact for sustainability initiatives." },
            ].map((u) => (
              <div key={u.title} className="p-6 rounded-2xl bg-white/4 border border-white/8 hover:border-blue-500/30 transition">
                <span className="text-2xl">{u.icon}</span>
                <h3 className="font-semibold mt-3 mb-2 text-sm">{u.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 md:px-12 py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <p className="text-blue-400 text-xs uppercase tracking-widest text-center mb-3">FAQ</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-14">
            Common questions
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-white/8 bg-white/4 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-medium hover:bg-white/4 transition"
                >
                  <span>{faq.q}</span>
                  <span className={`text-blue-400 text-lg transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-24 text-center border-t border-white/5">
        <h2 className="text-3xl font-bold">Ready to explore Earth data?</h2>
        <p className="text-gray-400 mt-4 max-w-md mx-auto">
          Start analyzing satellite imagery in seconds. No setup required.
        </p>
        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => router.push("/login")}
            className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-600/20"
          >
            login
          </button>
          <button
            onClick={() => router.push("/register")}
            className="px-8 py-4 rounded-xl border border-white/15 hover:border-white/30 transition"
          >
            Create Account
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-12 py-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2 font-semibold text-gray-400">🌍 GeoAI Platform</div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-gray-300 transition">Features</a>
            <a href="#tech" className="hover:text-gray-300 transition">Tech</a>
            <a href="#faq" className="hover:text-gray-300 transition">FAQ</a>
          </div>
          <div>© {new Date().getFullYear()} — Built with FastAPI + Next.js + Google Earth Engine</div>
        </div>
      </footer>

    </main>
  );
}