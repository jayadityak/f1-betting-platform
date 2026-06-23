"use client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import { teamColor } from "@/lib/utils";

interface Driver {
  id: string;
  name: string;
  team_id: string;
  cumulative: Record<number, number>;
}

interface Props {
  rounds: number[];
  drivers: Driver[];
}

const COLORS = ["#e10600", "#27F4D2", "#FF8000", "#3671C6", "#229971", "#FF87BC", "#64C4FF", "#f59e0b"];

export default function PointsProgressionChart({ rounds, drivers }: Props) {
  const data = rounds.map((rnd) => {
    const row: Record<string, any> = { round: `R${rnd}` };
    drivers.forEach((d) => {
      row[d.id] = d.cumulative[rnd] ?? null;
    });
    return row;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "12px 16px", minWidth: 160,
      }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>{label}</div>
        {[...payload].sort((a, b) => b.value - a.value).map((p: any) => (
          <div key={p.name} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: p.color }}>{p.name}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{p.value} pts</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="round"
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
          formatter={(value) => <span style={{ color: "var(--text-secondary)" }}>{value}</span>}
        />
        {drivers.map((d, i) => (
          <Line
            key={d.id}
            type="monotone"
            dataKey={d.id}
            name={d.name.split(" ").pop() || d.id}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
