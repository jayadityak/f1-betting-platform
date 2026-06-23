"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const CareerChart = dynamic(() => import("@/components/charts/CareerChart"), { ssr: false });

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Props {
  driverId: string;
  driverName: string;
}

export default function CareerSection({ driverId, driverName }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/drivers/${driverId}/career`)
      .then((r) => r.ok ? r.json() : [])
      .then((d) => { setData(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [driverId]);

  if (loading) {
    return (
      <div className="card" style={{ padding: 24, minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading career data…</span>
      </div>
    );
  }

  if (data.length === 0) return null;

  const totalWins = data.reduce((s, d) => s + d.wins, 0);
  const totalPodiums = data.reduce((s, d) => s + d.podiums, 0);
  const totalRaces = data.reduce((s, d) => s + d.races, 0);
  const totalPoints = data.reduce((s, d) => s + d.points, 0);
  const bestSeason = data.reduce((best, d) => d.wins > best.wins ? d : best, data[0]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Career overview stat row */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Career Overview</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {data[0]?.season} – {data[data.length - 1]?.season} · {data.length} seasons
            </p>
          </div>
          <span className="pill pill-red">ALL TIME</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "RACES", value: totalRaces },
            { label: "WINS", value: totalWins, color: "var(--f1-red)" },
            { label: "PODIUMS", value: totalPodiums, color: "var(--yellow)" },
            { label: "POINTS", value: totalPoints.toFixed(0) },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center", padding: "12px 0", borderRadius: 10, background: "var(--bg-secondary)" }}>
              <div className="stat-label" style={{ marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color ?? "var(--text-primary)", lineHeight: 1 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
        {bestSeason?.wins > 0 && (
          <div style={{ marginTop: 16, fontSize: 12, color: "var(--text-secondary)" }}>
            Best season: <strong style={{ color: "var(--text-primary)" }}>{bestSeason.season}</strong>
            {" "}— {bestSeason.wins} wins, {bestSeason.podiums} podiums, {bestSeason.points.toFixed(0)} pts
          </div>
        )}
      </div>

      {/* Career chart */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Career History</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Wins &amp; podiums by season</p>
          </div>
          <button
            onClick={() => setExpanded((e) => !e)}
            style={{
              fontSize: 12, color: "var(--text-secondary)", background: "var(--bg-secondary)",
              border: "1px solid var(--border)", borderRadius: 6, padding: "4px 12px", cursor: "pointer",
            }}
          >
            {expanded ? "Hide table" : "Show table"}
          </button>
        </div>
        <CareerChart data={data} />

        {expanded && (
          <div style={{ marginTop: 20, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Year", "Races", "Wins", "Podiums", "Points"].map((h) => (
                    <th key={h} style={{
                      textAlign: h === "Year" ? "left" : "right",
                      padding: "0 8px 8px 0",
                      color: "var(--text-muted)", fontWeight: 600, fontSize: 10, letterSpacing: "0.06em",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...data].reverse().map((row) => (
                  <tr key={row.season} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "7px 8px 7px 0", fontWeight: 700 }}>{row.season}</td>
                    <td style={{ padding: "7px 8px 7px 0", textAlign: "right", color: "var(--text-secondary)" }}>{row.races}</td>
                    <td style={{ padding: "7px 8px 7px 0", textAlign: "right", fontWeight: row.wins > 0 ? 700 : 400, color: row.wins > 0 ? "var(--f1-red)" : "var(--text-secondary)" }}>{row.wins}</td>
                    <td style={{ padding: "7px 8px 7px 0", textAlign: "right", fontWeight: row.podiums > 0 ? 700 : 400, color: row.podiums > 0 ? "var(--yellow)" : "var(--text-secondary)" }}>{row.podiums}</td>
                    <td style={{ padding: "7px 8px 7px 0", textAlign: "right", fontFamily: "monospace" }}>{row.points.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
