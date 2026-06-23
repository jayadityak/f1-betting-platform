import { api } from "@/lib/api";

export const revalidate = 3600;

const CIRCUITS = [
  { id: "monza", name: "Monza", country: "Italy" },
  { id: "monaco", name: "Monaco", country: "Monaco" },
  { id: "silverstone", name: "Silverstone", country: "UK" },
  { id: "spa", name: "Spa-Francorchamps", country: "Belgium" },
  { id: "suzuka", name: "Suzuka", country: "Japan" },
  { id: "interlagos", name: "Interlagos", country: "Brazil" },
  { id: "bahrain", name: "Bahrain International", country: "Bahrain" },
  { id: "albert_park", name: "Albert Park", country: "Australia" },
];

export default async function HistoryPage() {
  const winnersResults = await Promise.allSettled(
    CIRCUITS.map((c) => api.circuits.winners(c.id))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.4px", marginBottom: 6 }}>History Database</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          All-time winners and records at iconic F1 circuits — 1950 to present.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {CIRCUITS.map((circuit, i) => {
          const winners = winnersResults[i].status === "fulfilled" ? winnersResults[i].value : [];
          const top = winners.slice(0, 5);
          const total = winners.reduce((sum: number, w: any) => sum + w.wins, 0);
          return (
            <div key={circuit.id} className="card" style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{circuit.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{circuit.country}</div>
                </div>
                <span className="pill pill-blue" style={{ fontSize: 10 }}>{total} races</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {top.map((w: any, j: number) => (
                  <div key={w.driver} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                      background: j === 0 ? "var(--f1-red)" : "var(--bg-secondary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700,
                      color: j === 0 ? "#fff" : "var(--text-muted)",
                    }}>
                      {j + 1}
                    </span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: j === 0 ? 700 : 500 }}>{w.driver}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: j === 0 ? "var(--f1-red)" : "var(--text-secondary)" }}>
                      {w.wins}W
                    </span>
                  </div>
                ))}
                {winners.length === 0 && (
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>No data available.</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
