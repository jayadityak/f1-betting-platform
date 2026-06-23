import httpx
import asyncio

BASE = "https://api.jolpi.ca/ergast/f1"

async def get(path: str) -> dict:
    if "?" in path:
        base_path, query = path.split("?", 1)
        url = f"{BASE}{base_path}.json?{query}"
    else:
        url = f"{BASE}{path}.json"
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(url)
        r.raise_for_status()
        return r.json()

async def current_standings():
    data = await get("/current/driverStandings")
    return data["MRData"]["StandingsTable"]["StandingsLists"][0]["DriverStandings"]

async def constructor_standings():
    data = await get("/current/constructorStandings")
    return data["MRData"]["StandingsTable"]["StandingsLists"][0]["ConstructorStandings"]

async def current_schedule():
    data = await get("/current")
    return data["MRData"]["RaceTable"]["Races"]

async def race_results(season: str, round_num: str):
    data = await get(f"/{season}/{round_num}/results")
    races = data["MRData"]["RaceTable"]["Races"]
    return races[0] if races else None

async def qualifying_results(season: str, round_num: str):
    data = await get(f"/{season}/{round_num}/qualifying")
    races = data["MRData"]["RaceTable"]["Races"]
    return races[0] if races else None

async def driver_results(driver_id: str, season: str = "current"):
    data = await get(f"/{season}/drivers/{driver_id}/results")
    return data["MRData"]["RaceTable"]["Races"]

async def circuit_history(circuit_id: str, limit: int = 10):
    data = await get(f"/circuits/{circuit_id}/results?limit={limit}")
    return data["MRData"]["RaceTable"]["Races"]

async def driver_info(driver_id: str):
    data = await get(f"/drivers/{driver_id}")
    drivers = data["MRData"]["DriverTable"]["Drivers"]
    return drivers[0] if drivers else None

async def all_drivers_current():
    data = await get("/current/drivers")
    return data["MRData"]["DriverTable"]["Drivers"]

async def lap_times(season: str, round_num: str, lap: str = "1"):
    data = await get(f"/{season}/{round_num}/laps/{lap}")
    races = data["MRData"]["RaceTable"]["Races"]
    return races[0]["Laps"][0]["Timings"] if races else []

async def pit_stops(season: str, round_num: str):
    data = await get(f"/{season}/{round_num}/pitstops")
    races = data["MRData"]["RaceTable"]["Races"]
    return races[0]["PitStops"] if races else []

async def career_results(driver_id: str):
    # Jolpi caps at 100 results per page — paginate to get all career races
    first = await get(f"/drivers/{driver_id}/results?limit=100&offset=0")
    total = int(first["MRData"].get("total", 0))
    races = first["MRData"]["RaceTable"]["Races"]
    if total > 100:
        extra = await asyncio.gather(*[
            get(f"/drivers/{driver_id}/results?limit=100&offset={off}")
            for off in range(100, total, 100)
        ])
        for page in extra:
            if isinstance(page, dict):
                races.extend(page["MRData"]["RaceTable"]["Races"])
    return races
