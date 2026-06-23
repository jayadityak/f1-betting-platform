"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const LapTimeChart = dynamic(() => import("@/components/charts/LapTimeChart"), { ssr: false });
const TrackMapSVG = dynamic(() => import("@/components/charts/TrackMapSVG"), { ssr: false });

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Props {
  season: string;
  round: string;
}

export default function RaceTelemetrySection({ season, round }: Props) {
  const [lapData, setLapData] = useState<any[]>([]);
  const [trackData, setTrackData] = useState<any>(null);
  const [lapsLoading, setLapsLoading] = useState(true);
  const [trackLoading, setTrackLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/telemetry/race/${season}/${round}/laps`)
      .then((r) => r.ok ? r.json() : [])
      .then((d) => { setLapData(Array.isArray(d) ? d : []); setLapsLoading(false); })
      .catch(() => setLapsLoading(false));

    fetch(`${BASE}/telemetry/race/${season}/${round}/track`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setTrackData(d); setTrackLoading(false); })
      .catch(() => setTrackLoading(false));
  }, [season, round]);

  const nothingToShow = !lapsLoading && !trackLoading && lapData.length === 0 && !trackData;
  if (nothingToShow) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <h2 style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.3px" }}>Circuit Analysis</h2>
        <span className="pill pill-blue" style={{ fontSize: 10 }}>FASTF1</span>
      </div>

      {/* Track Map */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Track Map</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Fastest sector per driver — qualifying session</p>
          </div>
          <span className="pill pill-yellow" style={{ fontSize: 10 }}>QUALIFYING SECTORS</span>
        </div>
        {trackLoading ? (
          <div style={{
            height: 320, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 10,
            background: "var(--bg-secondary)", borderRadius: 12,
          }}>
            <div style={{ fontSize: 24 }}>🏎️</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading telemetry…</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>FastF1 may take 20–30s on first load</div>
          </div>
        ) : trackData?.track_points?.length > 0 ? (
          <TrackMapSVG
            track_points={trackData.track_points}
            sector1_end_dist={trackData.sector1_end_dist}
            sector2_end_dist={trackData.sector2_end_dist}
            total_dist={trackData.total_dist}
            sectors={trackData.sectors}
            circuit_name={trackData.circuit_name}
          />
        ) : (
          <div style={{ padding: 32, textAlign: "center", background: "var(--bg-secondary)", borderRadius: 12 }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Track map unavailable — telemetry data not found for this round.
            </div>
          </div>
        )}
      </div>

      {/* Lap Time Chart */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Lap Time Progression</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Clean laps only (outliers removed)</p>
          </div>
          <span className="pill pill-green" style={{ fontSize: 10 }}>RACE LAPS</span>
        </div>
        {lapsLoading ? (
          <div style={{
            height: 300, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 10,
            background: "var(--bg-secondary)", borderRadius: 12,
          }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading lap data…</div>
          </div>
        ) : lapData.length > 0 ? (
          <LapTimeChart drivers={lapData} />
        ) : (
          <div style={{ padding: 32, textAlign: "center", background: "var(--bg-secondary)", borderRadius: 12 }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Lap data unavailable for this round.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
