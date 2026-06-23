import H2HClient from "./H2HClient";
import { api } from "@/lib/api";

export const revalidate = 60;

export default async function ComparePage() {
  const standings = await api.standings.drivers().catch(() => []);
  const drivers = standings.map((d: any) => ({
    id: d.Driver?.driverId,
    name: `${d.Driver?.givenName} ${d.Driver?.familyName}`,
    team: d.Constructors?.[0]?.name,
    points: d.points,
  }));
  return <H2HClient drivers={drivers} />;
}
