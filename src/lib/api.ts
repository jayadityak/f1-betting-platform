const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function get<T>(path: string, revalidate = 60): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      next: { revalidate },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  standings: {
    drivers: () => get<any[]>("/standings/drivers"),
    constructors: () => get<any[]>("/standings/constructors"),
  },
  races: {
    schedule: () => get<any[]>("/races/schedule"),
    results: (season: string, round: string) => get<any>(`/races/${season}/${round}/results`),
    qualifying: (season: string, round: string) => get<any>(`/races/${season}/${round}/qualifying`),
    pitstops: (season: string, round: string) => get<any[]>(`/races/${season}/${round}/pitstops`),
  },
  drivers: {
    all: () => get<any[]>("/drivers/"),
    profile: (id: string) => get<any>(`/drivers/${id}`),
    career: (id: string) => get<any[]>(`/drivers/${id}/career`, 3600),
    atCircuit: (driverId: string, circuitId: string) =>
      get<any>(`/drivers/${driverId}/circuit/${circuitId}`),
  },
  betting: {
    odds: () => get<any[]>("/betting/odds"),
    value: (circuitId: string) => get<any[]>(`/betting/value/${circuitId}`),
  },
  live: {
    session: () => get<any>("/live/session"),
    positions: () => get<any[]>("/live/positions"),
    intervals: () => get<any[]>("/live/intervals"),
    pit: () => get<any[]>("/live/pit"),
    stints: () => get<any[]>("/live/stints"),
    weather: () => get<any[]>("/live/weather"),
    raceControl: () => get<any[]>("/live/race-control"),
    drivers: () => get<any[]>("/live/drivers"),
  },
  circuits: {
    history: (id: string, limit = 10) => get<any[]>(`/circuits/${id}/history?limit=${limit}`),
    winners: (id: string) => get<any[]>(`/circuits/${id}/winners`),
  },
  season: {
    progress: () => get<any>("/season/progress", 300),
    h2h: (a: string, b: string) => get<any>(`/season/h2h/${a}/${b}`, 120),
  },
  telemetry: {
    laps: (year: number, gp: string, session: string) =>
      get<any[]>(`/telemetry/session/${year}/${gp}/${session}`, 3600),
    speed: (year: number, gp: string, session: string, driver: string) =>
      get<any[]>(`/telemetry/speed/${year}/${gp}/${session}/${driver}`, 3600),
    sectors: (year: number, gp: string, session: string) =>
      get<any[]>(`/telemetry/sectors/${year}/${gp}/${session}`, 3600),
    raceLaps: (year: number, round: number) =>
      get<any[]>(`/telemetry/race/${year}/${round}/laps`, 3600),
    trackMap: (year: number, round: number) =>
      get<any>(`/telemetry/race/${year}/${round}/track`, 3600),
  },
};
