"use client";
import { useState, useEffect } from "react";
import { valueLabel } from "@/lib/utils";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const CIRCUITS = [
  { id: "monza", name: "Monza" },
  { id: "monaco", name: "Monaco" },
  { id: "silverstone", name: "Silverstone" },
  { id: "spa", name: "Spa-Francorchamps" },
  { id: "suzuka", name: "Suzuka" },
  { id: "interlagos", name: "Interlagos" },
  { id: "bahrain", name: "Bahrain" },
  { id: "albert_park", name: "Albert Park" },
  { id: "red_bull_ring", name: "Red Bull Ring" },
  { id: "hungaroring", name: "Hungaroring" },
  { id: "zandvoort", name: "Zandvoort" },
  { id: "rodriguez", name: "Mexico City" },
  { id: "americas", name: "Circuit of The Americas" },
  { id: "yas_marina", name: "Yas Marina" },
];

export default function BettingClient() {
  const [circuit, setCircuit] = useState("monza");
  const [valueData, setValueData] = useState<any[]>([]);
  const [odds, setOdds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      fetch(`${BASE}/betting/value/${circuit}`).then((r) => r.json()),
      fetch(`${BASE}/betting/odds`).then((r) => r.json()),
    ]).then(([vRes, oRes]) => {
      const v = vRes.status === "fulfilled" ? vRes.value : [];
      const o = oRes.status === "fulfilled" ? oRes.value : [];
      setValueData(Array.isArray(v) ? v : []);
      setOdds(Array.isArray(o) ? o : []);
      setLoading(false);
    });
  }, [circuit]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>

      {/* Header */}
      <div>
        <div style={{ marginBottom: 8 }}>
          <span className="pill pill-yellow">BETTING INSIGHTS</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.4px", marginBottom: 6 }}>
          Value Finder
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 520 }}>
          Compare historical win rates at each circuit against current bookmaker implied probabilities to find value bets.
        </p>
      </div>

      {/* How it works */}
      <div style={{
        background: "rgba(245,158,11,0.06)",
        border: "1px solid rgba(245,158,11,0.2)",
        borderRadius: 12, padding: 20,
      }}>
        <h3 style={{ fontWeight: 700, fontSize: 13, color: "var(--yellow)", marginBottom: 8 }}>
          How Value Score Works
        </h3>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
          <strong style={{ color: "var(--text-primary)" }}>Value Score = Historical win rate − Bookmaker implied probability.</strong>{" "}
          Positive = market undervaluing this driver at this track. Negative = overpriced.
          Odds data appears live during race weekends.
        </p>
      </div>

      {/* Circuit Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>Select Circuit:</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CIRCUITS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCircuit(c.id)}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: circuit === c.id ? 700 : 400,
                background: circuit === c.id ? "var(--f1-red)" : "var(--bg-card)",
                border: `1px solid ${circuit === c.id ? "var(--f1-red)" : "var(--border)"}`,
                color: circuit === c.id ? "#fff" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Value Table */}
      <div className="card" style={{ padding: 24, overflowX: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: 15 }}>
            {CIRCUITS.find((c) => c.id === circuit)?.name} — Circuit History vs. Odds
          </h2>
          {loading && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Loading…</span>}
        </div>

        {!loading && valueData.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
            No data found for this circuit. Try another track.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Driver", "Track Wins", "Races Here", "Win Rate", "Implied Prob", "Odds", "Value Score", "Signal"].map((h) => (
                  <th key={h} style={{
                    textAlign: "left", padding: "0 16px 10px 0",
                    color: "var(--text-muted)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {valueData.map((d: any, i: number) => {
                const signal = valueLabel(d.value_score ?? 0);
                return (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px 12px 0", fontWeight: 600 }}>{d.name}</td>
                    <td style={{ padding: "12px 16px 12px 0" }}>{d.wins}</td>
                    <td style={{ padding: "12px 16px 12px 0", color: "var(--text-secondary)" }}>{d.races}</td>
                    <td style={{ padding: "12px 16px 12px 0", fontWeight: 700 }}>{d.win_rate}%</td>
                    <td style={{ padding: "12px 16px 12px 0", color: "var(--text-secondary)" }}>
                      {d.implied_prob ? `${d.implied_prob}%` : "—"}
                    </td>
                    <td style={{ padding: "12px 16px 12px 0", fontFamily: "monospace" }}>
                      {d.odds ? `×${d.odds}` : "—"}
                    </td>
                    <td style={{
                      padding: "12px 16px 12px 0", fontWeight: 700,
                      color: (d.value_score ?? 0) > 0 ? "var(--green)" : "var(--f1-red)",
                    }}>
                      {d.value_score != null
                        ? (d.value_score > 0 ? `+${d.value_score}` : d.value_score)
                        : "—"}
                    </td>
                    <td style={{ padding: "12px 16px 12px 0" }}>
                      <span className={`pill ${signal.cls}`}>{signal.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Live Odds */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Live Odds Feed</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20 }}>
          Raw odds across bookmakers via The Odds API.
        </p>
        {odds.length === 0 ? (
          <div style={{
            padding: 32, textAlign: "center",
            background: "var(--bg-secondary)", borderRadius: 10,
          }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>📅</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>No Active Markets</div>
            <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
              F1 odds appear on The Odds API during race weekends. Next up: Austrian GP (June 28).
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {odds.slice(0, 5).map((event: any) => (
              <div key={event.id} style={{
                padding: 16, borderRadius: 10,
                background: "var(--bg-secondary)", border: "1px solid var(--border)",
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                  {event.sport_title} — {event.home_team}
                </div>
                {event.bookmakers?.slice(0, 2).map((bk: any) => (
                  <div key={bk.key} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6 }}>
                      {bk.title.toUpperCase()}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {bk.markets?.[0]?.outcomes?.map((o: any) => (
                        <div key={o.name} style={{
                          padding: "6px 12px", borderRadius: 8,
                          background: "var(--bg-card)", border: "1px solid var(--border)", fontSize: 12,
                        }}>
                          <span style={{ color: "var(--text-secondary)" }}>{o.name}</span>
                          <span style={{ fontWeight: 700, marginLeft: 8, color: "var(--green)" }}>×{o.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
