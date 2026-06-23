from fastapi import APIRouter, HTTPException
import fastf1
import pandas as pd
import os

router = APIRouter()

CACHE_DIR = os.path.join(os.path.dirname(__file__), "..", "cache")
fastf1.Cache.enable_cache(CACHE_DIR)

@router.get("/session/{year}/{gp}/{session_type}")
async def session_telemetry(year: int, gp: str, session_type: str = "R"):
    try:
        session = fastf1.get_session(year, gp, session_type)
        session.load(laps=True, telemetry=False, weather=False, messages=False)

        drivers = session.drivers[:5]
        result = []
        for drv in drivers:
            drv_laps = session.laps.pick_drivers(drv).pick_quicklaps()
            if drv_laps.empty:
                continue
            lap_times = []
            for _, lap in drv_laps.iterrows():
                t = lap["LapTime"]
                if pd.notna(t):
                    lap_times.append({
                        "lap": int(lap["LapNumber"]),
                        "time_s": round(t.total_seconds(), 3),
                    })
            info = session.get_driver(drv)
            result.append({
                "driver": info.get("Abbreviation", drv),
                "full_name": f"{info.get('FirstName', '')} {info.get('LastName', '')}".strip(),
                "team": info.get("TeamName", ""),
                "team_color": f"#{info.get('TeamColor', '888888')}",
                "laps": lap_times,
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/speed/{year}/{gp}/{session_type}/{driver}")
async def speed_trace(year: int, gp: str, session_type: str, driver: str):
    try:
        session = fastf1.get_session(year, gp, session_type)
        session.load(laps=True, telemetry=True, weather=False, messages=False)

        lap = session.laps.pick_drivers(driver).pick_fastest()
        if lap is None or lap.empty:
            raise HTTPException(status_code=404, detail="No fastest lap found")

        tel = lap.get_telemetry()
        sampled = tel[["Distance", "Speed", "Throttle", "Brake", "DRS"]].iloc[::5]
        return sampled.fillna(0).to_dict(orient="records")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/sectors/{year}/{gp}/{session_type}")
async def sector_times(year: int, gp: str, session_type: str = "Q"):
    try:
        session = fastf1.get_session(year, gp, session_type)
        session.load(laps=True, telemetry=False, weather=False, messages=False)

        results = []
        for drv in session.drivers:
            fastest = session.laps.pick_drivers(drv).pick_fastest()
            if fastest is None or fastest.empty:
                continue
            info = session.get_driver(drv)
            def to_ms(t):
                return round(t.total_seconds() * 1000) if pd.notna(t) else None

            results.append({
                "driver": info.get("Abbreviation", drv),
                "team": info.get("TeamName", ""),
                "team_color": f"#{info.get('TeamColor', '888888')}",
                "s1": to_ms(fastest.get("Sector1Time")),
                "s2": to_ms(fastest.get("Sector2Time")),
                "s3": to_ms(fastest.get("Sector3Time")),
                "lap_time_ms": to_ms(fastest.get("LapTime")),
            })

        results.sort(key=lambda x: x["lap_time_ms"] or 999999)
        return results
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
