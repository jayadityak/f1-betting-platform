import { api } from "@/lib/api";
import { teamColor } from "@/lib/utils";
import Link from "next/link";

export const revalidate = 60;

export default async function DriversPage() {
  const [standingsRes] = await Promise.allSettled([
    api.standings.drivers(),
  ]);

  const standings = standingsRes.status === "fulfilled" ? standingsRes.value : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.4px", marginBottom: 6 }}>Drivers</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>2026 season standings with full career stats</p>
      </div>

      {/* H2H link */}
      <Link href="/drivers/compare" style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
        background: "var(--bg-card)", border: "1px solid var(--border)",
        color: "var(--text-primary)", textDecoration: "none", marginBottom: 8,
        transition: "border-color 0.15s",
      }}>
        ⚔️ Head-to-Head Comparison →
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {standings.map((d: any, i: number) => {
          const color = teamColor(d.Constructors?.[0]?.constructorId ?? "");
          const driverId = d.Driver?.driverId;
          return (
            <Link
              key={driverId}
              href={`/drivers/${driverId}`}
              style={{ textDecoration: "none", display: "block" }}
            >
              <div
                className="card"
                style={{
                  padding: 20,
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                {/* Team color stripe */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 3,
                  background: color,
                }} />

                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginTop: 4 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>
                      #{d.Driver?.permanentNumber ?? d.position}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>
                      {d.Driver?.givenName} {d.Driver?.familyName}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                      {d.Constructors?.[0]?.name}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: i === 0 ? "var(--f1-red)" : "var(--text-primary)" }}>
                      {d.points}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>PTS</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 16, marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, marginBottom: 2 }}>WINS</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{d.wins}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, marginBottom: 2 }}>POS</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>P{d.position}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, marginBottom: 2 }}>NAT</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{d.Driver?.nationality?.slice(0, 3).toUpperCase()}</div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
