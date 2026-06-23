from fastapi import APIRouter
from services import ergast

router = APIRouter()

@router.get("/schedule")
async def schedule():
    return await ergast.current_schedule()

@router.get("/{season}/{round}/results")
async def results(season: str, round: str):
    return await ergast.race_results(season, round)

@router.get("/{season}/{round}/qualifying")
async def qualifying(season: str, round: str):
    return await ergast.qualifying_results(season, round)

@router.get("/{season}/{round}/pitstops")
async def pitstops(season: str, round: str):
    return await ergast.pit_stops(season, round)
