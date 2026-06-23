import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const revalidate = 60;

export default async function RacesPage() {
  const schedule = await api.races.schedule().catch(() => []);
  const today = new Date();

  const past = schedule.filter((r: any) => new Date(r.date) < today).reverse();
  const upcoming = schedule.filter((r: any) => new Date(r.date) >= today);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.4px", marginBottom: 6 }}>Race Calendar</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          {upcoming.length} races remaining in the 2026 season
        </p>
      </div>

      {upcoming.length > 0 && (
        <section>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 14 }}>
            UPCOMING
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {upcoming.map((r: any, i: number) => (
              <RaceRow key={r.round} race={r} isNext={i === 0} completed={false} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 14 }}>
            COMPLETED
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {past.map((r: any) => (
              <RaceRow key={r.round} race={r} isNext={false} completed />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function RaceRow({ race, isNext, completed }: { race: any; isNext: boolean; completed: boolean }) {
  return (
    <Link href={`/races/2026/${race.round}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        className="card"
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: isNext ? "rgba(225,6,0,0.06)" : "var(--bg-card)",
          borderColor: isNext ? "rgba(225,6,0,0.25)" : "var(--border)",
          cursor: "pointer",
        }}
      >
        <span style={{
          fontSize: 12, fontWeight: 700, width: 32, textAlign: "center",
          color: isNext ? "var(--f1-red)" : "var(--text-muted)",
        }}>
          R{race.round}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{race.raceName}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            {race.Circuit?.circuitName} · {race.Circuit?.Location?.country}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{formatDate(race.date)}</div>
          {isNext && (
            <span className="pill pill-red" style={{ marginTop: 4, fontSize: 10 }}>Next Race</span>
          )}
          {completed && (
            <span className="pill pill-yellow" style={{ marginTop: 4, fontSize: 10 }}>Completed</span>
          )}
        </div>
        <span style={{ color: "var(--text-muted)", fontSize: 16 }}>›</span>
      </div>
    </Link>
  );
}
