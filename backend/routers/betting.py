from fastapi import APIRouter, HTTPException
from services import odds, ergast

router = APIRouter()

@router.get("/odds")
async def f1_odds():
    try:
        return await odds.get_f1_odds()
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@router.get("/events")
async def f1_events():
    try:
        return await odds.get_f1_events()
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@router.get("/value/{circuit_id}")
async def value_finder(circuit_id: str):
    """Compare historical win rates at circuit vs current odds implied probability."""
    circuit_races = await ergast.circuit_history(circuit_id, limit=20)
    standings = await ergast.current_standings()

    win_rates = {}
    for race in circuit_races:
        for result in race.get("Results", []):
            if result["position"] == "1":
                did = result["Driver"]["driverId"]
                name = f"{result['Driver']['givenName']} {result['Driver']['familyName']}"
                win_rates[did] = win_rates.get(did, {"name": name, "wins": 0, "races": 0})
                win_rates[did]["wins"] += 1
        for result in race.get("Results", []):
            did = result["Driver"]["driverId"]
            if did in win_rates:
                win_rates[did]["races"] += 1

    for did in win_rates:
        wr = win_rates[did]
        wr["win_rate"] = round(wr["wins"] / max(wr["races"], 1) * 100, 1)

    try:
        live_odds = await odds.get_f1_odds()
        for event in live_odds:
            for bookmaker in event.get("bookmakers", [])[:1]:
                for market in bookmaker.get("markets", []):
                    if market["key"] == "h2h":
                        for outcome in market["outcomes"]:
                            name = outcome["name"].lower().replace(" ", "_")
                            for did, data in win_rates.items():
                                if did in name or name in data["name"].lower().replace(" ", "_"):
                                    impl = odds.implied_probability(outcome["price"])
                                    data["implied_prob"] = impl
                                    data["odds"] = outcome["price"]
                                    data["value_score"] = odds.value_score(data["win_rate"], impl)
    except Exception:
        pass

    return sorted(win_rates.values(), key=lambda x: x.get("value_score", 0), reverse=True)
