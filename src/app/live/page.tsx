"use client";
import { useEffect, useState, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function fetchJSON(path: string) {
  const r = await fetch(`${API}${path}`);
  if (!r.ok) return null;
  return r.json();
}

export default function LivePage() {
  const [session, setSession] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [raceControl, setRaceControl] = useState<any[]>([]);
  const [stints, setStints] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const load = useCallback(async () => {
    const [s, p, w, rc, st, d] = await Promise.allSettled([
      fetchJSON("/live/session"),
      fetchJSON("/live/positions"),
      fetchJSON("/live/weather"),
      fetchJSON("/live/race-control"),
      fetchJSON("/live/stints"),
      fetchJSON("/live/drivers"),
    ]);
    if (s.status === "fulfilled") setSession(s.value);
    if (p.status === "fulfilled") setPositions(p.value ?? []);
    if (w.status === "fulfilled") setWeather(Array.isArray(w.value) ? w.value[w.value.length - 1] : w.value);
    if (rc.status === "fulfilled") setRaceControl((rc.value ?? []).slice(-5).reverse());
    if (st.status === "fulfilled") setStints(st.value ?? []);
    if (d.status === "fulfilled") setDrivers(d.value ?? []);
    setLastUpdate(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  const TIRE_COLORS: Record<string, string> = {
    SOFT: "#e10600",
    MEDIUM: "#f59e0b",
    HARD: "#ffffff",
    INTERMEDIATE: "#22c55e",
    WET: "#3b82f6",
  };

  const driverMap = Object.fromEntries(drivers.map((d: any) => [d.driver_number, d]));
  const stintMap: Record<number, any> = {};
  for (const st of stints) {
    if (!stintMap[st.driver_number] || st.lap_start > stintMap[st.driver_number].lap_start) {
      stintMap[st.driver_number] = st;
    }
  }

  const latest = Object.values(
    positions.reduce((acc: any, p: any) => {
      if (!acc[p.driver_number] || p.date > acc[p.driver_number].date) {
        acc[p.driver_number] = p;
      }
      return acc;
    }, {})
  ).sort((a: any, b: any) => a.position - b.position);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", background: "var(--green)",
              boxShadow: "0 0 8px var(--green)", display: "inline-block",
            }} />
            <span className="pill pill-green" style={{ fontSize: 10 }}>LIVE</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.4px", marginBottom: 4 }}>
            Live Race Tracker
          </h1>
          {session && (
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              {session.meeting_name ?? "—"} · {session.session_name ?? "—"} · {session.location ?? "—"}, {session.country_name ?? "—"}
            </p>
          )}
        </div>
        {lastUpdate && (
          <div style={{ textAlign: "right" }}>
            <div className="stat-label">Last Updated</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
              {lastUpdate.toLocaleTimeString()}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Refreshes every 15s</div>
          </div>
        )}
      </div>

      {/* No session */}
      {!loading && !session && (
        <div style={{
          padding: 48, textAlign: "center",
          background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏎️</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>No Active Session</div>
          <div style={{ color: "var(--text-secondary)", fontSize: 13, maxWidth: 360, margin: "0 auto" }}>
            Live data appears here during practice, qualifying, and race sessions. Come back on race weekend.
          </div>
        </div>
      )}

      {session && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
          {/* Position Tower */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: 14, marginBottom: 18 }}>Positions</h2>
            {loading ? (
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
            ) : latest.length === 0 ? (
              <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>No position data yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {latest.map((p: any) => {
                  const drv = driverMap[p.driver_number];
                  const stint = stintMap[p.driver_number];
                  const tire = stint?.compound ?? "—";
                  const tireColor = TIRE_COLORS[tire] ?? "#888";
                  return (
                    <div key={p.driver_number} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{
                        width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                        background: p.position <= 3 ? "var(--f1-red)" : "var(--bg-secondary)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700,
                        color: p.position <= 3 ? "#fff" : "var(--text-secondary)",
                      }}>
                        {p.position}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          {drv ? `${drv.first_name ?? ""} ${drv.last_name ?? ""}`.trim() || `#${p.driver_number}` : `#${p.driver_number}`}
                        </div>
                        {drv?.team_name && (
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{drv.team_name}</div>
                        )}
                      </div>
                      {tire !== "—" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <div style={{
                            width: 14, height: 14, borderRadius: "50%",
                            background: tireColor, border: "2px solid rgba(255,255,255,0.2)",
                          }} />
                          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{tire.slice(0, 1)}</span>
                          {stint?.lap_start && (
                            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>L{stint.lap_start}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Weather */}
            {weather && (
              <div className="card" style={{ padding: 20 }}>
                <h2 style={{ fontWeight: 700, fontSize: 13, marginBottom: 14 }}>Track Conditions</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Air Temp", value: weather.air_temperature ? `${weather.air_temperature}°C` : "—" },
                    { label: "Track Temp", value: weather.track_temperature ? `${weather.track_temperature}°C` : "—" },
                    { label: "Humidity", value: weather.humidity ? `${weather.humidity}%` : "—" },
                    { label: "Wind", value: weather.wind_speed ? `${weather.wind_speed} km/h` : "—" },
                    { label: "Rainfall", value: weather.rainfall ? "Yes 🌧️" : "No ☀️" },
                    { label: "Pressure", value: weather.pressure ? `${weather.pressure} mbar` : "—" },
                  ].map((w) => (
                    <div key={w.label}>
                      <div className="stat-label" style={{ marginBottom: 2 }}>{w.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{w.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Race Control Messages */}
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontWeight: 700, fontSize: 13, marginBottom: 14 }}>Race Control</h2>
              {raceControl.length === 0 ? (
                <p style={{ color: "var(--text-secondary)", fontSize: 12 }}>No messages yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {raceControl.map((msg: any, i: number) => (
                    <div key={i} style={{
                      padding: "8px 12px", borderRadius: 8,
                      background: "var(--bg-secondary)",
                      fontSize: 12,
                    }}>
                      <div style={{ color: "var(--text-muted)", fontSize: 10, marginBottom: 3 }}>
                        {msg.category?.toUpperCase()} · {msg.date ? new Date(msg.date).toLocaleTimeString() : ""}
                      </div>
                      <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>{msg.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
