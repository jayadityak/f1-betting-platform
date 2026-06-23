from fastapi import APIRouter
from services import ergast

router = APIRouter()

@router.get("/drivers")
async def driver_standings():
    return await ergast.current_standings()

@router.get("/constructors")
async def constructor_standings():
    return await ergast.constructor_standings()
