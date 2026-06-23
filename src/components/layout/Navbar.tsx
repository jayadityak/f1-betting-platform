"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/",        label: "Home" },
  { href: "/races",   label: "Races" },
  { href: "/drivers", label: "Drivers" },
  { href: "/betting", label: "Betting Insights" },
  { href: "/live",    label: "Live" },
  { href: "/history", label: "History" },
];

export default function Navbar() {
  const path = usePathname();

  return (
    <nav
      style={{
        background: "rgba(10,10,10,0.92)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          height: 60,
          gap: 8,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 32, textDecoration: "none" }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "var(--f1-red)",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 14,
              color: "#fff",
              letterSpacing: "-0.5px",
            }}
          >
            F1
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
            PitWager
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 2, flex: 1 }}>
          {links.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  background: active ? "var(--bg-card)" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  border: active ? "1px solid var(--border)" : "1px solid transparent",
                  whiteSpace: "nowrap",
                }}
              >
                {l.label === "Betting Insights" && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--yellow)",
                      marginRight: 6,
                      verticalAlign: "middle",
                      marginBottom: 1,
                    }}
                  />
                )}
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              display: "inline-block",
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--green)",
              boxShadow: "0 0 8px var(--green)",
              animation: "pulse 2s infinite",
            }}
          />
          <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>LIVE</span>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </nav>
  );
}
