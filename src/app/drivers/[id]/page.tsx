import { api } from "@/lib/api";
import { teamColor, formatDate } from "@/lib/utils";

export const revalidate = 60;

export default async function DriverPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const profile = await api.drivers.profile(id).catch(() => null);
  if (!profile) return <div style={{ color: "var(--text-secondary)" }}>Driver not found.</div>;

  const { info, season_results, wins, podiums, races } = profile;
  const color = teamColor(season_results?.[0]?.Results?.[0]?.Constructor?.constructorId ?? "");

  const points = season_results?.reduce(
    (sum: number, r: any) => sum + parseFloat(r.Results?.[0]?.points ?? "0"),
    0
  ) ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Header */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 32,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 4,
          background: color,
        }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6 }}>
              #{info?.permanentNumber ?? "—"}
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 6 }}>
              {info?.givenName} {info?.familyName}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              {info?.nationality} · Born {info?.dateOfBirth}
            </p>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            {[
              { label: "Points", value: points },
              { label: "Wins", value: wins },
              { label: "Podiums", value: podiums },
              { label: "Races", value: races },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div className="stat-label" style={{ marginBottom: 4 }}>{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Season Results Table */}
      <div className="card" style={{ padding: 24, overflowX: "auto" }}>
        <h2 style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>2026 Season Results</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Rd", "Race", "Grid", "Pos", "Points", "Status"].map((h) => (
                <th key={h} style={{
                  textAlign: "left", padding: "0 12px 10px 0",
                  color: "var(--text-muted)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {season_results?.map((r: any) => {
              const res = r.Results?.[0];
              const pos = parseInt(res?.position ?? "99");
              return (
                <tr key={r.round} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 12px 10px 0", color: "var(--text-muted)" }}>{r.round}</td>
                  <td style={{ padding: "10px 12px 10px 0", fontWeight: 600 }}>{r.raceName}</td>
                  <td style={{ padding: "10px 12px 10px 0", color: "var(--text-secondary)" }}>{res?.grid}</td>
                  <td style={{ padding: "10px 12px 10px 0" }}>
                    <span style={{
                      fontWeight: 700,
                      color: pos === 1 ? "var(--f1-red)" : pos <= 3 ? "var(--yellow)" : "var(--text-primary)",
                    }}>
                      {pos <= 20 ? `P${pos}` : res?.position}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px 10px 0", fontWeight: 600 }}>{res?.points}</td>
                  <td style={{ padding: "10px 12px 10px 0", color: "var(--text-muted)", fontSize: 12 }}>{res?.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
