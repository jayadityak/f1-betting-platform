from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import standings, races, drivers, betting, live, circuits, telemetry, season
import uvicorn

app = FastAPI(title="F1 Betting Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(standings.router, prefix="/standings", tags=["standings"])
app.include_router(races.router, prefix="/races", tags=["races"])
app.include_router(drivers.router, prefix="/drivers", tags=["drivers"])
app.include_router(betting.router, prefix="/betting", tags=["betting"])
app.include_router(live.router, prefix="/live", tags=["live"])
app.include_router(circuits.router, prefix="/circuits", tags=["circuits"])
app.include_router(telemetry.router, prefix="/telemetry", tags=["telemetry"])
app.include_router(season.router, prefix="/season", tags=["season"])

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
