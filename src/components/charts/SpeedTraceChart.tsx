"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface Props {
  data: { Distance: number; Speed: number; Throttle: number; Brake: number }[];
  color?: string;
  driver?: string;
}

export default function SpeedTraceChart({ data, color = "#e10600", driver }: Props) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 8, padding: "10px 14px", fontSize: 12,
      }}>
        <div style={{ color: "var(--text-muted)", marginBottom: 6 }}>{Math.round(label)}m</div>
        <div style={{ color, fontWeight: 700 }}>{payload[0]?.value} km/h</div>
      </div>
    );
  };

  return (
    <div>
      {driver && (
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>
          {driver} — Fastest Lap Speed Trace
        </div>
      )}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="Distance"
            tick={{ fill: "var(--text-muted)", fontSize: 10 }}
            axisLine={false} tickLine={false}
            tickFormatter={(v) => `${Math.round(v / 1000)}km`}
          />
          <YAxis
            domain={[0, 380]}
            tick={{ fill: "var(--text-muted)", fontSize: 10 }}
            axisLine={false} tickLine={false}
            width={36}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="Speed"
            stroke={color}
            strokeWidth={2}
            fill="url(#speedGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
