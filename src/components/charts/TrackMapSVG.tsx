"use client";

interface TrackPoint {
  x: number;
  y: number;
  d: number;
  speed: number;
}

interface SectorLeader {
  sector: number;
  driver: string;
  full_name: string;
  team: string;
  team_color: string;
  time_ms: number;
}

interface Props {
  track_points: TrackPoint[];
  sector1_end_dist: number | null;
  sector2_end_dist: number | null;
  total_dist: number;
  sectors: SectorLeader[];
  circuit_name?: string;
}

function fmtMs(ms: number) {
  const s = ms / 1000;
  const m = Math.floor(s / 60);
  const rem = (s % 60).toFixed(3).padStart(6, "0");
  return m > 0 ? `${m}:${rem}` : `${rem}s`;
}

function pointsToPolyline(pts: TrackPoint[]) {
  return pts.map((p) => `${p.x},${p.y}`).join(" ");
}

export default function TrackMapSVG({
  track_points, sector1_end_dist, sector2_end_dist,
  total_dist, sectors, circuit_name,
}: Props) {
  if (!track_points?.length) return null;

  const s1Color = sectors[0]?.team_color ?? "#e10600";
  const s2Color = sectors[1]?.team_color ?? "#27F4D2";
  const s3Color = sectors[2]?.team_color ?? "#FF8000";

  const s1pts = sector1_end_dist != null
    ? track_points.filter((p) => p.d <= sector1_end_dist)
    : [];
  const s2pts = (sector1_end_dist != null && sector2_end_dist != null)
    ? track_points.filter((p) => p.d > sector1_end_dist && p.d <= sector2_end_dist)
    : [];
  const s3pts = sector2_end_dist != null
    ? track_points.filter((p) => p.d > sector2_end_dist)
    : [];

  // Join sector ends so there are no gaps between segments
  const s1Full = s1pts.length > 0 && s2pts.length > 0 ? [...s1pts, s2pts[0]] : s1pts;
  const s2Full = s2pts.length > 0 && s3pts.length > 0 ? [...s2pts, s3pts[0]] : s2pts;

  const sectorConfig = [
    { label: "S1", pts: s1Full, color: s1Color, leader: sectors[0] },
    { label: "S2", pts: s2Full, color: s2Color, leader: sectors[1] },
    { label: "S3", pts: s3pts, color: s3Color, leader: sectors[2] },
  ];

  return (
    <div>
      {circuit_name && (
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, fontWeight: 600, letterSpacing: "0.06em" }}>
          {circuit_name.toUpperCase()} — QUALIFYING SECTOR LEADERS
        </div>
      )}

      {/* SVG Track */}
      <div style={{ background: "var(--bg-secondary)", borderRadius: 12, overflow: "hidden", position: "relative" }}>
        <svg
          viewBox="0 0 800 600"
          style={{ width: "100%", height: "auto", display: "block" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Full track hairline (gray background) */}
          <polyline
            points={pointsToPolyline(track_points)}
            fill="none"
            stroke="#333"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Sector colored overlays */}
          {sectorConfig.map(({ label, pts, color }) =>
            pts.length > 1 ? (
              <polyline
                key={label}
                points={pointsToPolyline(pts)}
                fill="none"
                stroke={color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.9}
              />
            ) : null
          )}
          {/* Sector boundary markers */}
          {[
            s1pts[s1pts.length - 1],
            s2pts[s2pts.length - 1],
          ].filter(Boolean).map((pt, i) => pt && (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={6}
              fill="#0a0a0a"
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
          {/* Start/finish marker */}
          {track_points[0] && (
            <circle
              cx={track_points[0].x}
              cy={track_points[0].y}
              r={7}
              fill="var(--f1-red)"
              stroke="#fff"
              strokeWidth={2}
            />
          )}
        </svg>

        {/* Sector legend overlay */}
        <div style={{
          position: "absolute", top: 12, right: 12,
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          {sectorConfig.map(({ label, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 16, height: 4, borderRadius: 2, background: color }} />
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sector cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
        {sectorConfig.map(({ label, color, leader }) => (
          <div key={label} style={{
            padding: "14px 16px", borderRadius: 10,
            background: "var(--bg-secondary)",
            border: `1px solid ${color}44`,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 3,
              background: color,
            }} />
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, marginBottom: 8 }}>
              SECTOR {label.replace("S", "")}
            </div>
            {leader ? (
              <>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{leader.driver}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 8 }}>
                  {leader.team}
                </div>
                <div style={{
                  fontFamily: "monospace", fontWeight: 800, fontSize: 16,
                  color: color,
                }}>
                  {fmtMs(leader.time_ms)}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>No data</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
