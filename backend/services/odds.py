import httpx
import os
from dotenv import load_dotenv

load_dotenv()

BASE = "https://api.the-odds-api.com/v4"
API_KEY = os.getenv("ODDS_API_KEY")

async def get_f1_odds():
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(
            f"{BASE}/sports/motorsport_formula_one/odds",
            params={
                "apiKey": API_KEY,
                "regions": "uk,eu,us",
                "markets": "h2h",
                "oddsFormat": "decimal",
            }
        )
        r.raise_for_status()
        return r.json()

async def get_f1_events():
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(
            f"{BASE}/sports/motorsport_formula_one/events",
            params={"apiKey": API_KEY}
        )
        r.raise_for_status()
        return r.json()

def implied_probability(decimal_odds: float) -> float:
    if decimal_odds <= 0:
        return 0.0
    return round(1 / decimal_odds * 100, 2)

def value_score(historical_win_rate: float, implied_prob: float) -> float:
    """Positive = value bet, negative = overpriced."""
    return round(historical_win_rate - implied_prob, 2)
