"use client";

import { useEffect, useState } from "react";
import { healthCheck } from "@/lib/api";

type HealthStatus = "loading" | "connected" | "error";

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
    <main className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold">Poker Solver</h1>
        <p className="text-gray-400 text-xl">Real-time poker equity calculator</p>
        <div className="flex gap-3 justify-center mt-2">
          <a
            href="/calculator"
            className="px-4 py-2 bg-primary text-black font-medium rounded-md hover:bg-primary/80 transition-colors text-sm"
          >
            Equity Calculator
          </a>
          <a
            href="/range-builder"
            className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 font-medium rounded-md hover:text-white transition-colors text-sm"
          >
            Range Builder
          </a>
        </div>
        {status === "loading" && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-sm">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            Connecting to API...
          </div>
        )}
        {status === "connected" && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            API Connected {version && `(v${version})`}
          </div>
        )}
        {status === "error" && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm">
            <span className="w-2 h-2 bg-red-400 rounded-full" />
            API Offline
          </div>
        )}
      </div>
    </main>
  );
}
