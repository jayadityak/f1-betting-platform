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


@router.get("/race/{year}/{round_num}/laps")
async def race_lap_times(year: int, round_num: int):
    """All drivers' lap times for a race — used for the lap time progression chart."""
    try:
        session = fastf1.get_session(year, round_num, "R")
        session.load(laps=True, telemetry=False, weather=False, messages=False)

        result = []
        for drv in session.drivers[:10]:
            drv_laps = session.laps.pick_drivers(drv).pick_quicklaps()
            if drv_laps.empty:
                continue
            info = session.get_driver(drv)
            lap_times = []
            for _, lap in drv_laps.iterrows():
                t = lap["LapTime"]
                if pd.notna(t):
                    lap_times.append({
                        "lap": int(lap["LapNumber"]),
                        "time_s": round(t.total_seconds(), 3),
                    })
            if lap_times:
                result.append({
                    "driver": info.get("Abbreviation", drv),
                    "full_name": f"{info.get('FirstName', '')} {info.get('LastName', '')}".strip(),
                    "team_color": f"#{info.get('TeamColor', '888888')}",
                    "laps": lap_times,
                })
        return result
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/race/{year}/{round_num}/track")
async def track_map(year: int, round_num: int):
    """Circuit SVG coordinates + fastest sector leaders from qualifying."""
    try:
        session = fastf1.get_session(year, round_num, "Q")
        session.load(laps=True, telemetry=True, weather=False, messages=False)

        fastest = session.laps.pick_fastest()
        if fastest is None or fastest.empty:
            raise HTTPException(status_code=404, detail="No fastest lap found")

        full_tel = fastest.get_telemetry()[
            ["SessionTime", "Distance", "X", "Y", "Speed"]
        ].reset_index(drop=True)

        def dist_at_session_time(session_time):
            if pd.isnull(session_time):
                return None
            diffs = (full_tel["SessionTime"] - session_time).abs()
            idx = int(diffs.idxmin())
            return round(float(full_tel.loc[idx, "Distance"]), 1)

        s1_t = fastest["Sector1SessionTime"]
        s2_t = (
            s1_t + fastest["Sector2Time"]
            if pd.notna(s1_t) and pd.notna(fastest["Sector2Time"])
            else None
        )
        s1_dist = dist_at_session_time(s1_t)
        s2_dist = dist_at_session_time(s2_t)

        # Downsample for transfer (~250 points is enough for a smooth SVG)
        tel = full_tel.iloc[::3].copy()

        xmin = float(tel["X"].min()); xmax = float(tel["X"].max())
        ymin = float(tel["Y"].min()); ymax = float(tel["Y"].max())
        x_range = xmax - xmin or 1
        y_range = ymax - ymin or 1
        scale = min(800 / x_range, 600 / y_range) * 0.88  # slight padding
        x_off = (800 - x_range * scale) / 2
        y_off = (600 - y_range * scale) / 2

        points = [
            {
                "x": round((float(r["X"]) - xmin) * scale + x_off, 1),
                "y": round(600 - ((float(r["Y"]) - ymin) * scale + y_off), 1),
                "d": round(float(r["Distance"]), 1),
                "speed": round(float(r["Speed"])) if pd.notna(r["Speed"]) else 0,
            }
            for _, r in tel.iterrows()
        ]

        # Fastest driver per sector across all quick laps
        laps = session.laps.pick_quicklaps()
        sector_leaders = []
        for s_num, col in [(1, "Sector1Time"), (2, "Sector2Time"), (3, "Sector3Time")]:
            valid = laps.dropna(subset=[col])
            if valid.empty:
                continue
            best = valid.loc[valid[col].idxmin()]
            info = session.get_driver(best["Driver"])
            sector_leaders.append({
                "sector": s_num,
                "driver": info.get("Abbreviation", best["Driver"]),
                "full_name": f"{info.get('FirstName', '')} {info.get('LastName', '')}".strip(),
                "team": info.get("TeamName", ""),
                "team_color": f"#{info.get('TeamColor', '888888')}",
                "time_ms": round(best[col].total_seconds() * 1000),
            })

        return {
            "track_points": points,
            "sector1_end_dist": s1_dist,
            "sector2_end_dist": s2_dist,
            "total_dist": round(float(full_tel["Distance"].max()), 1),
            "circuit_name": session.event.get("EventName", ""),
            "sectors": sector_leaders,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
