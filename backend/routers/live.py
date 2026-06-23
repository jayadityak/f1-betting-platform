from fastapi import APIRouter
from services import openf1

router = APIRouter()

@router.get("/session")
async def latest_session():
    return await openf1.latest_session()

@router.get("/positions")
async def positions():
    session = await openf1.latest_session()
    if not session:
        return []
    return await openf1.positions(session["session_key"])

@router.get("/intervals")
async def intervals():
    session = await openf1.latest_session()
    if not session:
        return []
    return await openf1.intervals(session["session_key"])

@router.get("/pit")
async def pit_stops():
    session = await openf1.latest_session()
    if not session:
        return []
    return await openf1.pit_data(session["session_key"])

@router.get("/stints")
async def stints():
    session = await openf1.latest_session()
    if not session:
        return []
    return await openf1.stints(session["session_key"])

@router.get("/weather")
async def weather():
    session = await openf1.latest_session()
    if not session:
        return []
    return await openf1.weather(session["session_key"])

@router.get("/race-control")
async def race_control():
    session = await openf1.latest_session()
    if not session:
        return []
    return await openf1.race_control(session["session_key"])

@router.get("/drivers")
async def live_drivers():
    session = await openf1.latest_session()
    if not session:
        return []
    return await openf1.drivers_in_session(session["session_key"])
