import { api } from "@/lib/api";
import { formatDate, daysUntil, teamColor } from "@/lib/utils";
import PointsChartWrapper from "@/components/charts/PointsChartWrapper";

export const revalidate = 60;

export default async function HomePage() {
  const [drivers, constructors, schedule, progressRes] = await Promise.allSettled([
    api.standings.drivers(),
    api.standings.constructors(),
    api.races.schedule(),
    api.season.progress(),
  ]);

  const driverStandings = drivers.status === "fulfilled" ? drivers.value : [];
  const constructorStandings = constructors.status === "fulfilled" ? constructors.value : [];
  const races = schedule.status === "fulfilled" ? schedule.value : [];
  const progress = progressRes.status === "fulfilled" ? progressRes.value : null;

  const today = new Date();
  const upcomingRaces = races.filter((r: any) => new Date(r.date) >= today);
  const nextRace = upcomingRaces[0] ?? null;
  const daysLeft = nextRace ? daysUntil(nextRace.date) : null;
  const completedRaces = races.filter((r: any) => new Date(r.date) < today);
  const lastRace = completedRaces[completedRaces.length - 1] ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

      {/* Hero */}
      <section>
        <div style={{ marginBottom: 10 }}>
          <span className="pill pill-red" style={{ fontSize: 10, letterSpacing: "0.1em" }}>2026 SEASON</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 10 }}>
          F1 Betting Intelligence
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 540 }}>
          Deep stats, live telemetry, and betting value signals for every Grand Prix.
        </p>
      </section>

      {/* Next Race Banner */}
      {nextRace && (
        <section
          style={{
            background: "linear-gradient(135deg, #1a0000 0%, #0d0d0d 60%)",
            border: "1px solid rgba(225,6,0,0.3)",
            borderRadius: 16,
            padding: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div className="stat-label" style={{ marginBottom: 6 }}>Next Race</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{nextRace.raceName}</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              {nextRace.Circuit?.circuitName}
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
              {nextRace.Circuit?.Location?.locality}, {nextRace.Circuit?.Location?.country} · {formatDate(nextRace.date)}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="stat-label" style={{ marginBottom: 4 }}>Race In</div>
            <div style={{ fontSize: 56, fontWeight: 900, color: "var(--f1-red)", lineHeight: 1 }}>
              {daysLeft}
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
              {daysLeft === 1 ? "day" : "days"}
            </div>
          </div>
        </section>
      )}

      {/* Standings Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>

        {/* Driver Standings */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 14 }}>Driver Standings</h3>
            <span className="pill pill-blue">2026</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {driverStandings.slice(0, 8).map((d: any, i: number) => (
              <div key={d.Driver?.driverId} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: i === 0 ? "var(--f1-red)" : "var(--bg-secondary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                  color: i === 0 ? "#fff" : "var(--text-secondary)",
                }}>
                  {d.position}
                </span>
                <div style={{
                  width: 3, height: 24, borderRadius: 2, flexShrink: 0,
                  background: teamColor(d.Constructors?.[0]?.constructorId ?? ""),
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {d.Driver?.givenName} {d.Driver?.familyName}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: 11 }}>
                    {d.Constructors?.[0]?.name}
                  </div>
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {d.points}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Constructor Standings */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 14 }}>Constructor Standings</h3>
            <span className="pill pill-blue">2026</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {constructorStandings.slice(0, 8).map((c: any) => {
              const ptsNum = parseInt(c.points);
              const maxPts = parseInt(constructorStandings[0]?.points ?? "1");
              const pct = maxPts > 0 ? Math.round((ptsNum / maxPts) * 100) : 0;
              const color = teamColor(c.Constructor?.constructorId ?? "");
              return (
                <div key={c.Constructor?.constructorId}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "var(--text-muted)", fontSize: 11, width: 14 }}>{c.position}</span>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{c.Constructor?.name}</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{c.points}</span>
                  </div>
                  <div style={{ height: 3, background: "var(--border)", borderRadius: 2 }}>
                    <div style={{ height: "100%", borderRadius: 2, width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Races */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 14 }}>Upcoming Races</h3>
            <span className="pill pill-yellow">{upcomingRaces.length} left</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {upcomingRaces.slice(0, 7).map((r: any, i: number) => (
              <div
                key={r.round}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "8px 10px", borderRadius: 8,
                  background: i === 0 ? "rgba(225,6,0,0.08)" : "transparent",
                  border: i === 0 ? "1px solid rgba(225,6,0,0.2)" : "1px solid transparent",
                }}
              >
                <span style={{
                  fontSize: 11, fontWeight: 700, width: 28, textAlign: "center",
                  color: i === 0 ? "var(--f1-red)" : "var(--text-muted)",
                }}>
                  R{r.round}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.raceName}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {r.Circuit?.Location?.country}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-secondary)", flexShrink: 0 }}>
                  {formatDate(r.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Points Progression Chart */}
      {progress && progress.rounds?.length > 1 && (
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Points Progression</h2>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Top 8 drivers — cumulative points by round</p>
            </div>
            <span className="pill pill-red">2026</span>
          </div>
          <PointsChartWrapper rounds={progress.rounds} drivers={progress.drivers} />
        </div>
      )}

      {/* Last Race link */}
      {lastRace && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
          <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>
            Last Race: <strong style={{ color: "var(--text-primary)" }}>{lastRace.raceName}</strong> · {formatDate(lastRace.date)} ·{" "}
          </span>
          <a href={`/races`} style={{ color: "var(--f1-red)", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
            View results →
          </a>
        </div>
      )}

    </div>
  );
}
