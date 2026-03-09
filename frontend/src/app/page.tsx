"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calculator, LayoutGrid, Zap, ArrowRight, Activity, Users, Layers } from "lucide-react";
import { healthCheck } from "@/lib/api";

type HealthStatus = "loading" | "connected" | "error";

const FEATURES = [
  {
    title: "Equity Calculator",
    desc: "Hand vs hand or range vs range equity with Monte Carlo simulation and exact enumeration.",
    href: "/calculator",
    badge: "NLHE + PLO",
    icon: Calculator,
    gradient: "from-emerald-500/20 to-emerald-500/0",
    glow: "group-hover:shadow-emerald-500/10",
  },
  {
    title: "Range Builder",
    desc: "Interactive 13x13 matrix with bidirectional text sync, presets, and save/load.",
    href: "/range-builder",
    badge: "Visual",
    icon: LayoutGrid,
    gradient: "from-blue-500/20 to-blue-500/0",
    glow: "group-hover:shadow-blue-500/10",
  },
  {
    title: "Multi-Format",
    desc: "Full support for NLHE, PLO4, PLO5, and PLO6 with proper hole card rules.",
    href: "/calculator",
    badge: "4 formats",
    icon: Zap,
    gradient: "from-amber-500/20 to-amber-500/0",
    glow: "group-hover:shadow-amber-500/10",
  },
];

const STATS = [
  { value: "4", label: "Formats", icon: Layers },
  { value: "6", label: "Max Players", icon: Users },
  { value: "<500ms", label: "Response Time", icon: Activity },
];

export default function Home() {
  const [status, setStatus] = useState<HealthStatus>("loading");
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    healthCheck().then((res) => {
      if (res.data) {
        setStatus("connected");
        setVersion(res.data.version);
      } else {
        setStatus("error");
      }
    });
  }, []);

  return (
    <main className="min-h-[calc(100vh-3.5rem)] relative">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] glow-green animate-pulse-glow" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] glow-blue" />
      </div>

      {/* Hero */}
      <section className="relative">
        <div className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-gray-400 mb-10 backdrop-blur-sm">
            {status === "loading" && (
              <>
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                Connecting to engine...
              </>
            )}
            {status === "connected" && (
              <>
                <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-sm shadow-emerald-400/50" />
                <span className="text-gray-300">Engine Online</span>
                {version && <span className="text-gray-600">v{version}</span>}
              </>
            )}
            {status === "error" && (
              <>
                <span className="w-2 h-2 bg-red-400 rounded-full" />
                Engine Offline
              </>
            )}
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.05]">
            Poker Equity
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
              Calculator
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto mb-12 leading-relaxed">
            Real-time equity calculations for NLHE and PLO.
            <br className="hidden sm:block" />
            Hand vs hand, range vs range, up to 6 players.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/calculator"
              className="btn-primary text-base px-10 py-3.5 flex items-center gap-2.5 group"
            >
              Open Calculator
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/range-builder" className="btn-secondary text-base px-8 py-3.5">
              Range Builder
            </Link>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="relative max-w-4xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-3 gap-4">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="stat-card">
                <Icon className="w-4 h-4 text-primary/60 mb-2" />
                <span className="text-2xl font-bold text-white tabular-nums">{stat.value}</span>
                <span className="text-[11px] text-gray-500 mt-0.5">{stat.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature cards */}
      <section className="relative max-w-5xl mx-auto px-4 pb-24">
        <div className="text-center mb-10">
          <span className="section-label">Features</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Link key={f.title} href={f.href} className={`feature-card ${f.glow}`}>
                {/* Top gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${f.gradient}`} />

                <div className="relative">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 group-hover:border-primary/30 transition-all duration-300">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/[0.05] text-gray-400 border border-white/[0.06] uppercase tracking-wider">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-white mb-2 group-hover:text-primary transition-colors duration-300">
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors duration-300">
                    {f.desc}
                  </p>

                  {/* Arrow indicator */}
                  <div className="mt-5 flex items-center gap-1.5 text-xs text-gray-600 group-hover:text-primary transition-all duration-300">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
