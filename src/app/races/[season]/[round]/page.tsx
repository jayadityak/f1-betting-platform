import { api } from "@/lib/api";
import { teamColor } from "@/lib/utils";
import RaceTelemetrySection from "./RaceTelemetrySection";

export const revalidate = 60;

export default async function RaceDetailPage({
  params,
}: {
  params: Promise<{ season: string; round: string }>;
}) {
  const { season, round } = await params;

  const [raceRes, qualiRes, pitsRes] = await Promise.allSettled([
    api.races.results(season, round),
    api.races.qualifying(season, round),
    api.races.pitstops(season, round),
  ]);

  const race = raceRes.status === "fulfilled" ? raceRes.value : null;
  const quali = qualiRes.status === "fulfilled" ? qualiRes.value : null;
  const pits = pitsRes.status === "fulfilled" ? pitsRes.value : [];

  if (!race) {
    return (
      <div style={{ color: "var(--text-secondary)" }}>
        Race data not available yet.
      </div>
    );
  }

  const results: any[] = race.Results ?? [];
  const qualiResults: any[] = quali?.QualifyingResults ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
          Round {race.round} · {season}
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.4px", marginBottom: 6 }}>
          {race.raceName}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          {race.Circuit?.circuitName} · {race.Circuit?.Location?.locality}, {race.Circuit?.Location?.country}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Race Results */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 14, marginBottom: 18 }}>Race Results</h2>
          {results.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Results not yet available.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {results.slice(0, 20).map((r: any) => {
                const pos = parseInt(r.position);
                const color = teamColor(r.Constructor?.constructorId ?? "");
                return (
                  <div key={r.position} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                      background: pos <= 3 ? (pos === 1 ? "var(--f1-red)" : pos === 2 ? "#555" : "#6b4f00") : "var(--bg-secondary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700,
                      color: pos <= 3 ? "#fff" : "var(--text-secondary)",
                    }}>
                      {r.position}
                    </span>
                    <div style={{ width: 3, height: 24, borderRadius: 2, background: color }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {r.Driver?.givenName} {r.Driver?.familyName}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.Constructor?.name}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{r.points} pts</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {r.Time?.time ?? r.status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Qualifying */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: 14, marginBottom: 18 }}>Qualifying</h2>
            {qualiResults.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Qualifying data not available.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {qualiResults.slice(0, 10).map((q: any) => {
                  const color = teamColor(q.Constructor?.constructorId ?? "");
                  return (
                    <div key={q.position} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 20, fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                        {q.position}
                      </span>
                      <div style={{ width: 3, height: 20, borderRadius: 2, background: color }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>
                          {q.Driver?.givenName} {q.Driver?.familyName}
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "monospace" }}>
                        {q.Q3 ?? q.Q2 ?? q.Q1 ?? "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pit Stops */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: 14, marginBottom: 18 }}>Pit Stops</h2>
            {pits.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Pit stop data not available.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pits.slice(0, 10).map((p: any, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", width: 24 }}>L{p.lap}</span>
                    <div style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{p.driverId}</div>
                    <span style={{
                      fontSize: 12, fontFamily: "monospace",
                      color: parseFloat(p.duration) < 3 ? "var(--green)" : "var(--text-secondary)",
                    }}>
                      {p.duration}s
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <RaceTelemetrySection season={season} round={round} />
    </div>
  );
}
