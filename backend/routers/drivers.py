from fastapi import APIRouter
from services import ergast

router = APIRouter()

@router.get("/")
async def all_drivers():
    return await ergast.all_drivers_current()

@router.get("/{driver_id}")
async def driver_profile(driver_id: str):
    info = await ergast.driver_info(driver_id)
    results = await ergast.driver_results(driver_id)
    wins = sum(1 for r in results if r.get("Results") and r["Results"][0]["position"] == "1")
    podiums = sum(
        1 for r in results
        if r.get("Results") and r["Results"][0].get("position", "").isdigit()
        and int(r["Results"][0]["position"]) <= 3
    )
    return {
        "info": info,
        "season_results": results,
        "wins": wins,
        "podiums": podiums,
        "races": len(results),
    }

@router.get("/{driver_id}/circuit/{circuit_id}")
async def driver_at_circuit(driver_id: str, circuit_id: str):
    all_races = await ergast.circuit_history(circuit_id, limit=30)
    driver_races = []
    for race in all_races:
        for result in race.get("Results", []):
            if result.get("Driver", {}).get("driverId") == driver_id:
                driver_races.append({
                    "season": race["season"],
                    "round": race["round"],
                    "circuit": race["Circuit"]["circuitName"],
                    "position": result["position"],
                    "grid": result["grid"],
                    "points": result["points"],
                    "status": result["status"],
                })
    wins = sum(1 for r in driver_races if r["position"] == "1")
    podiums = sum(1 for r in driver_races if int(r["position"]) <= 3)
    return {
        "driver_id": driver_id,
        "circuit_id": circuit_id,
        "races": driver_races,
        "wins": wins,
        "podiums": podiums,
        "win_rate": round(wins / len(driver_races) * 100, 1) if driver_races else 0,
    }
