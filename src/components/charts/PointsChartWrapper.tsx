"use client";
import dynamic from "next/dynamic";

const PointsProgressionChart = dynamic(
  () => import("./PointsProgressionChart"),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
        Loading chart…
      </div>
    ),
  }
);

export default function PointsChartWrapper(props: { rounds: number[]; drivers: any[] }) {
  return <PointsProgressionChart {...props} />;
}
