"use client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";

interface LapEntry {
  lap: number;
  time_s: number;
}
interface DriverLaps {
  driver: string;
  full_name: string;
  team_color: string;
  laps: LapEntry[];
}

interface Props {
  drivers: DriverLaps[];
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(3);
  return `${m}:${sec.padStart(6, "0")}`;
}

export default function LapTimeChart({ drivers }: Props) {
  const maxLap = Math.max(...drivers.flatMap((d) => d.laps.map((l) => l.lap)));
  const data = Array.from({ length: maxLap }, (_, i) => {
    const row: Record<string, any> = { lap: i + 1 };
    drivers.forEach((d) => {
      const found = d.laps.find((l) => l.lap === i + 1);
      row[d.driver] = found?.time_s ?? null;
    });
    return row;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "12px 16px",
      }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>
          Lap {label}
        </div>
        {[...payload].sort((a, b) => a.value - b.value).map((p: any) => (
          <div key={p.name} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: p.color, fontWeight: 600 }}>{p.name}</span>
            <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-primary)" }}>
              {fmtTime(p.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const allTimes = drivers.flatMap((d) => d.laps.map((l) => l.time_s));
  const minT = Math.min(...allTimes);
  const maxT = Math.max(...allTimes);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="lap"
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false} tickLine={false}
          label={{ value: "Lap", position: "insideBottomRight", offset: -8, fill: "var(--text-muted)", fontSize: 11 }}
        />
        <YAxis
          domain={[Math.floor(minT - 1), Math.ceil(maxT + 1)]}
          tickFormatter={fmtTime}
          tick={{ fill: "var(--text-muted)", fontSize: 10 }}
          axisLine={false} tickLine={false}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
          formatter={(value) => <span style={{ color: "var(--text-secondary)" }}>{value}</span>}
        />
        {drivers.map((d) => (
          <Line
            key={d.driver}
            type="monotone"
            dataKey={d.driver}
            stroke={d.team_color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
