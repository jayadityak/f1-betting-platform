"use client";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface DriverOption {
  id: string;
  name: string;
  team: string;
  points: string;
}

interface Props {
  drivers: DriverOption[];
}

export default function H2HClient({ drivers }: Props) {
  const [driverA, setDriverA] = useState(drivers[0]?.id ?? "");
  const [driverB, setDriverB] = useState(drivers[1]?.id ?? "");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function compare() {
    if (!driverA || !driverB || driverA === driverB) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/season/h2h/${driverA}/${driverB}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Failed to load comparison data.");
    }
    setLoading(false);
  }

  const StatCompare = ({
    label, a, b, aId, bId, higherIsBetter = true, suffix = "",
  }: {
    label: string; a: number; b: number; aId: string; bId: string;
    higherIsBetter?: boolean; suffix?: string;
  }) => {
    const aWins = higherIsBetter ? a > b : a < b;
    const bWins = higherIsBetter ? b > a : b < a;
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: aWins ? "var(--green)" : "var(--text-primary)" }}>
            {a}{suffix}
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, alignSelf: "center" }}>
            {label}
          </span>
          <span style={{ fontWeight: 700, fontSize: 18, color: bWins ? "var(--green)" : "var(--text-primary)" }}>
            {b}{suffix}
          </span>
        </div>
        <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", background: "var(--border)" }}>
          <div style={{
            width: `${a + b > 0 ? (a / (a + b)) * 100 : 50}%`,
            background: aWins ? "var(--green)" : "var(--f1-red)",
            transition: "width 0.5s ease",
          }} />
        </div>
      </div>
    );
  };

  const barData = result?.races?.map((r: any) => ({
    race: r.race.replace(" Grand Prix", "").replace(" GP", ""),
    [result.driver_a.id]: r.pos_a,
    [result.driver_b.id]: r.pos_b,
  })) ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.4px", marginBottom: 6 }}>
          Head-to-Head
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Compare any two drivers race by race across the 2026 season.
        </p>
      </div>

      {/* Selector */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>
              DRIVER A
            </label>
            <select
              value={driverA}
              onChange={(e) => setDriverA(e.target.value)}
              style={{
                width: "100%", background: "var(--bg-secondary)",
                border: "1px solid var(--border)", borderRadius: 8,
                color: "var(--text-primary)", padding: "10px 12px", fontSize: 13,
              }}
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.team})</option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: 20, fontWeight: 900, color: "var(--f1-red)", paddingBottom: 10, flexShrink: 0 }}>
            VS
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>
              DRIVER B
            </label>
            <select
              value={driverB}
              onChange={(e) => setDriverB(e.target.value)}
              style={{
                width: "100%", background: "var(--bg-secondary)",
                border: "1px solid var(--border)", borderRadius: 8,
                color: "var(--text-primary)", padding: "10px 12px", fontSize: 13,
              }}
            >
              {drivers.filter((d) => d.id !== driverA).map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.team})</option>
              ))}
            </select>
          </div>

          <button
            onClick={compare}
            disabled={loading || driverA === driverB}
            style={{
              padding: "10px 28px", borderRadius: 8, fontSize: 13, fontWeight: 700,
              background: "var(--f1-red)", color: "#fff", border: "none",
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
              flexShrink: 0, paddingBottom: 10,
            }}
          >
            {loading ? "Loading…" : "Compare →"}
          </button>
        </div>
        {error && <p style={{ color: "var(--f1-red)", fontSize: 13, marginTop: 12 }}>{error}</p>}
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Driver names header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center" }}>
            <div className="card" style={{ padding: 20, textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 20 }}>
                {result.driver_a.info?.givenName} {result.driver_a.info?.familyName}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                {result.driver_a.info?.nationality}
              </div>
              <div style={{
                fontSize: 36, fontWeight: 900, color: "var(--green)", marginTop: 12,
              }}>
                {result.driver_a.h2h_wins}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>H2H WINS</div>
            </div>

            <div style={{ textAlign: "center", color: "var(--text-muted)", fontWeight: 700, fontSize: 18 }}>
              {result.races.length} races
            </div>

            <div className="card" style={{ padding: 20, textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 20 }}>
                {result.driver_b.info?.givenName} {result.driver_b.info?.familyName}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                {result.driver_b.info?.nationality}
              </div>
              <div style={{
                fontSize: 36, fontWeight: 900,
                color: result.driver_b.h2h_wins >= result.driver_a.h2h_wins ? "var(--green)" : "var(--text-primary)",
                marginTop: 12,
              }}>
                {result.driver_b.h2h_wins}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>H2H WINS</div>
            </div>
          </div>

          {/* Stat comparison bars */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: 14, marginBottom: 24 }}>Season Stats Comparison</h2>
            <StatCompare
              label="Points"
              a={result.driver_a.total_pts}
              b={result.driver_b.total_pts}
              aId={result.driver_a.id}
              bId={result.driver_b.id}
              suffix=" pts"
            />
            <StatCompare
              label="Avg Finish Position"
              a={result.driver_a.avg_pos}
              b={result.driver_b.avg_pos}
              aId={result.driver_a.id}
              bId={result.driver_b.id}
              higherIsBetter={false}
            />
          </div>

          {/* Position chart */}
          {barData.length > 0 && (
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontWeight: 700, fontSize: 14, marginBottom: 20 }}>Finish Position by Race</h2>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
                Lower bar = better position (P1 is best)
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="race"
                    tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                    axisLine={false} tickLine={false}
                    angle={-35} textAnchor="end"
                  />
                  <YAxis
                    reversed
                    domain={[1, 20]}
                    tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                    axisLine={false} tickLine={false}
                    width={24}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-card)", border: "1px solid var(--border)",
                      borderRadius: 8, fontSize: 12,
                    }}
                  />
                  <Bar dataKey={result.driver_a.id} name={result.driver_a.info?.familyName} fill="#e10600" radius={[3, 3, 0, 0]} />
                  <Bar dataKey={result.driver_b.id} name={result.driver_b.info?.familyName} fill="#3b82f6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Race-by-race table */}
          <div className="card" style={{ padding: 24, overflowX: "auto" }}>
            <h2 style={{ fontWeight: 700, fontSize: 14, marginBottom: 18 }}>Race by Race</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: "0 12px 10px 0", color: "var(--text-muted)", fontSize: 11, fontWeight: 600 }}>Race</th>
                  <th style={{ textAlign: "center", padding: "0 12px 10px 0", color: "var(--f1-red)", fontSize: 11, fontWeight: 600 }}>
                    {result.driver_a.info?.familyName}
                  </th>
                  <th style={{ textAlign: "center", padding: "0 12px 10px 0", color: "#3b82f6", fontSize: 11, fontWeight: 600 }}>
                    {result.driver_b.info?.familyName}
                  </th>
                  <th style={{ textAlign: "center", padding: "0 0 10px 0", color: "var(--text-muted)", fontSize: 11, fontWeight: 600 }}>Winner</th>
                </tr>
              </thead>
              <tbody>
                {result.races.map((r: any) => (
                  <tr key={r.round} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 12px 10px 0", fontWeight: 500 }}>{r.race}</td>
                    <td style={{
                      padding: "10px 12px 10px 0", textAlign: "center", fontWeight: 700,
                      color: r.winner === result.driver_a.id ? "var(--green)" : "var(--text-secondary)",
                    }}>
                      P{r.pos_a}
                    </td>
                    <td style={{
                      padding: "10px 12px 10px 0", textAlign: "center", fontWeight: 700,
                      color: r.winner === result.driver_b.id ? "var(--green)" : "var(--text-secondary)",
                    }}>
                      P{r.pos_b}
                    </td>
                    <td style={{ padding: "10px 0", textAlign: "center" }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        color: r.winner === result.driver_a.id ? "var(--f1-red)" : "#3b82f6",
                      }}>
                        {r.winner === result.driver_a.id
                          ? result.driver_a.info?.familyName
                          : result.driver_b.info?.familyName}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!result && !loading && (
        <div style={{
          padding: 48, textAlign: "center",
          background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏁</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Select two drivers and hit Compare</div>
          <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
            See head-to-head records, stat bars, and race-by-race breakdowns.
          </div>
        </div>
      )}
    </div>
  );
}
