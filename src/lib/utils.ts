export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function positionSuffix(pos: number): string {
  if (pos === 1) return "1st";
  if (pos === 2) return "2nd";
  if (pos === 3) return "3rd";
  return `${pos}th`;
}

export function teamColor(constructor: string): string {
  const colors: Record<string, string> = {
    red_bull: "#3671C6",
    mercedes: "#27F4D2",
    ferrari: "#E8002D",
    mclaren: "#FF8000",
    aston_martin: "#229971",
    alpine: "#FF87BC",
    williams: "#64C4FF",
    rb: "#6692FF",
    kick_sauber: "#52E252",
    haas: "#B6BABD",
  };
  const key = constructor.toLowerCase().replace(/\s+/g, "_");
  return colors[key] ?? "#888888";
}

export function valueLabel(score: number): { label: string; cls: string } {
  if (score > 10) return { label: "Strong Value", cls: "pill-green" };
  if (score > 3)  return { label: "Value", cls: "pill-green" };
  if (score > -3) return { label: "Fair", cls: "pill-yellow" };
  return { label: "Overpriced", cls: "pill-red" };
}
