from fastapi import APIRouter
import asyncio
from services import ergast

router = APIRouter()

@router.get("/progress")
async def season_progress():
    """Cumulative points per driver per round — for the points progression chart."""
    from datetime import date
    schedule = await ergast.current_schedule()
    today = date.today().isoformat()
    completed = [r for r in schedule if r["date"] <= today]

    # Fetch all race results in parallel
    async def fetch_race(race):
        try:
            result = await ergast.race_results("current", race["round"])
            return race["round"], result
        except Exception:
            return race["round"], None

    race_results = await asyncio.gather(*[fetch_race(r) for r in completed])

    driver_series: dict[str, dict] = {}

    for rnd, result in sorted(race_results, key=lambda x: int(x[0])):
        if not result:
            continue
        for res in result.get("Results", []):
            did = res["Driver"]["driverId"]
            name = f"{res['Driver']['givenName']} {res['Driver']['familyName']}"
            pts = float(res.get("points", 0))
            team = res.get("Constructor", {}).get("name", "")
            team_id = res.get("Constructor", {}).get("constructorId", "")
            if did not in driver_series:
                driver_series[did] = {
                    "id": did, "name": name,
                    "team": team, "team_id": team_id, "rounds": {},
                }
            driver_series[did]["rounds"][int(rnd)] = pts

    all_rounds = sorted({int(r["round"]) for r in completed})

    for did, data in driver_series.items():
        cumulative = 0.0
        data["cumulative"] = {}
        for rnd in all_rounds:
            cumulative += data["rounds"].get(rnd, 0)
            data["cumulative"][rnd] = cumulative
        data["total"] = cumulative

    top = sorted(driver_series.values(), key=lambda x: -x["total"])[:8]
    return {"rounds": all_rounds, "drivers": top}


@router.get("/h2h/{driver_a}/{driver_b}")
async def head_to_head(driver_a: str, driver_b: str):
    """Head-to-head comparison for two drivers this season."""
    from datetime import date
    schedule = await ergast.current_schedule()
    today = date.today().isoformat()
    completed = [r for r in schedule if r["date"] <= today]

    async def fetch_race(race):
        try:
            result = await ergast.race_results("current", race["round"])
            return race, result
        except Exception:
            return race, None

    race_results = await asyncio.gather(*[fetch_race(r) for r in completed])

    shared_races = []
    for race, result in race_results:
        if not result:
            continue
        pos_a = pos_b = pts_a = pts_b = None
        for res in result.get("Results", []):
            did = res["Driver"]["driverId"]
            if did == driver_a:
                pos_a = int(res["position"]); pts_a = float(res.get("points", 0))
            if did == driver_b:
                pos_b = int(res["position"]); pts_b = float(res.get("points", 0))
        if pos_a is not None and pos_b is not None:
            shared_races.append({
                "round": int(race["round"]), "race": race["raceName"],
                "pos_a": pos_a, "pos_b": pos_b,
                "pts_a": pts_a, "pts_b": pts_b,
                "winner": driver_a if pos_a < pos_b else driver_b,
            })

    shared_races.sort(key=lambda x: x["round"])

    info_a, info_b = await asyncio.gather(
        ergast.driver_info(driver_a),
        ergast.driver_info(driver_b),
    )

    wins_a = sum(1 for r in shared_races if r["winner"] == driver_a)
    wins_b = len(shared_races) - wins_a
    total_a = sum(r["pts_a"] for r in shared_races)
    total_b = sum(r["pts_b"] for r in shared_races)
    n = max(len(shared_races), 1)
    avg_a = round(sum(r["pos_a"] for r in shared_races) / n, 2)
    avg_b = round(sum(r["pos_b"] for r in shared_races) / n, 2)

    return {
        "driver_a": {"id": driver_a, "info": info_a, "h2h_wins": wins_a, "total_pts": total_a, "avg_pos": avg_a},
        "driver_b": {"id": driver_b, "info": info_b, "h2h_wins": wins_b, "total_pts": total_b, "avg_pos": avg_b},
        "races": shared_races,
    }
