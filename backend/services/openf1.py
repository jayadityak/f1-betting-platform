import httpx

BASE = "https://api.openf1.org/v1"

async def get(path: str, params: dict = {}) -> list:
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(f"{BASE}{path}", params=params)
        r.raise_for_status()
        return r.json()

async def latest_session():
    sessions = await get("/sessions", {"session_key": "latest"})
    return sessions[0] if sessions else None

async def drivers_in_session(session_key: int):
    return await get("/drivers", {"session_key": session_key})

async def positions(session_key: int):
    return await get("/position", {"session_key": session_key})

async def lap_data(session_key: int, driver_number: int = None):
    params = {"session_key": session_key}
    if driver_number:
        params["driver_number"] = driver_number
    return await get("/laps", params)

async def pit_data(session_key: int):
    return await get("/pit", {"session_key": session_key})

async def car_data(session_key: int, driver_number: int):
    return await get("/car_data", {"session_key": session_key, "driver_number": driver_number})

async def intervals(session_key: int):
    return await get("/intervals", {"session_key": session_key})

async def weather(session_key: int):
    return await get("/weather", {"session_key": session_key})

async def race_control(session_key: int):
    return await get("/race_control", {"session_key": session_key})

async def stints(session_key: int):
    return await get("/stints", {"session_key": session_key})

async def meetings(year: int = None):
    params = {}
    if year:
        params["year"] = year
    return await get("/meetings", params)
