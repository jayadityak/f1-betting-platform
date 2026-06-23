"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell,
} from "recharts";

interface SeasonStat {
  season: string;
  races: number;
  wins: number;
  podiums: number;
  points: number;
}

interface Props {
  data: SeasonStat[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as SeasonStat;
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "12px 16px", minWidth: 140,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: "var(--text-muted)" }}>Races</span>
          <span style={{ fontWeight: 700 }}>{d?.races}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: "var(--f1-red)" }}>Wins</span>
          <span style={{ fontWeight: 700, color: "var(--f1-red)" }}>{d?.wins}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: "var(--yellow)" }}>Podiums</span>
          <span style={{ fontWeight: 700, color: "var(--yellow)" }}>{d?.podiums}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: "var(--text-muted)" }}>Points</span>
          <span style={{ fontWeight: 700 }}>{d?.points?.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
};

export default function CareerChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="season"
          tick={{ fill: "var(--text-muted)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "var(--text-muted)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={24}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
          formatter={(v) => <span style={{ color: "var(--text-secondary)" }}>{v}</span>}
        />
        <Bar dataKey="wins" name="Wins" fill="var(--f1-red)" radius={[3, 3, 0, 0]} maxBarSize={20} />
        <Bar dataKey="podiums" name="Podiums" fill="var(--yellow)" radius={[3, 3, 0, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
