from fastapi import APIRouter
from services import ergast

router = APIRouter()

@router.get("/")
async def all_circuits():
    data = await ergast.get("/circuits")
    return data["MRData"]["CircuitTable"]["Circuits"]

@router.get("/{circuit_id}/history")
async def circuit_history(circuit_id: str, limit: int = 10):
    return await ergast.circuit_history(circuit_id, limit)

@router.get("/{circuit_id}/winners")
async def circuit_winners(circuit_id: str):
    races = await ergast.circuit_history(circuit_id, limit=30)
    winners = {}
    for race in races:
        for result in race.get("Results", []):
            if result["position"] == "1":
                name = f"{result['Driver']['givenName']} {result['Driver']['familyName']}"
                winners[name] = winners.get(name, 0) + 1
    return sorted([{"driver": k, "wins": v} for k, v in winners.items()], key=lambda x: x["wins"], reverse=True)
