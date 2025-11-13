from datetime import datetime
from typing import Any, Dict, List

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from db_supabase.db_util import (
    add_user,
    login_user,
    send_verification_email as send_verification_email_service,
    verify_email as verify_email_service,
    is_user_verified as user_verified,
    get_user_by_id as get_user,
)

from db_supabase.db_level_user_progress_util import (
    add_learning_user,
    set_user_learning_progress,
    get_user_learning_progress,
    increment_user_level,
)

try:
    import yfinance as yf
except Exception:
    yf = None

import pandas as pd


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use "*" for local testing only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/send_verification_email")
async def send_verification_email_root(request: Request):
    data = await request.json()
    email = data.get("email")
    if not email:
        return {"status": "error", "message": "Missing email"}

    try:
        result = send_verification_email_service(email)
        return {"status": "success", "data": result}
    except Exception as e:
        print(" Error sending verification email:", e)
        return {"status": "error", "message": str(e)}


@app.post("/api/verify_email")
async def verify_email_root(request: Request):
    data = await request.json()
    result = verify_email_service(data["email"], data["verification_code"])
    return {"status": "success", "data": result}


@app.post("/api/is_user_verified")
async def is_user_verified_root(request: Request):
    data = await request.json()
    result = user_verified(data["email"])
    return {"status": "success", "data": result}


@app.post("/api/add_user")
async def add_user_root(request: Request):
    data = await request.json()
    result = add_user(data["name"], data["email"], data["password_hash"])
    return {"status": "success", "data": result}


@app.post("/api/login_user")
async def login_user_root(request: Request):
    data = await request.json()
    result = login_user(data["email"], data["password_hash"])
    return {"status": "success", "data": result}


@app.get("/api/user/{user_id}")
async def get_user_root(user_id: str):
    result = get_user(user_id)
    if not result:
        return {"status": "error", "message": "user not found"}
    return {"status": "success", "data": result}

@app.post("/api/add_learning_user")
async def add_learning_user_root(request: Request):
    data = await request.json()
    result = add_learning_user(
        data["uid"], 
        data.get("starting_level_progress", 0), 
        data.get("starting_lesson_progress", 0),
    )
    return {"status": "success", "data": result}

@app.post("/api/set_user_learning_progress")
async def set_user_learning_progress_root(request: Request):
    data = await request.json()
    result = set_user_learning_progress(
        data["uid"], 
        data["level_progress"],
        data["lesson_progress"],
    )
    return {"status": "success", "data": result}

@app.post("/api/get_user_learning_progress")
async def get_user_learning_progress_root(request: Request):
    data = await request.json()
    result = get_user_learning_progress(data["uid"])
    if result is None:
        new = add_learning_user(data["uid"], 0, 0)
        if new and new.get("success"):
            result = new["user"]
        else:
            return {"status": "error", "message": "failed to find progress"}
    return {"status": "success", "data": result}

@app.post("/api/increment_user_level")
async def increment_user_level_root(request: Request):
    data = await request.json()
    result = increment_user_level(data["uid"])
    return {"status": "success", "data": result.data if hasattr(result, "data") else result}

@app.post("/api/strategies/buy_hold")
async def run_buy_and_hold(request: Request):
    if yf is None:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Server missing yfinance. Install backend requirements.",
            },
        )

    try:
        payload = await request.json()
    except Exception:
        return {"status": "error", "message": "Invalid JSON body"}

    ticker = (payload.get("ticker") or "").upper().strip()
    start_date = payload.get("start_date")
    end_date = payload.get("end_date")
    capital_raw = payload.get("capital")

    try:
        capital = float(capital_raw)
    except (TypeError, ValueError):
        return {"status": "error", "message": "Invalid capital amount"}

    if not ticker or not start_date or not end_date:
        return {"status": "error", "message": "Missing required fields"}

    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
    except Exception:
        return {
            "status": "error",
            "message": "Invalid date format. Use YYYY-MM-DD",
        }

    if start_dt >= end_dt:
        return {"status": "error", "message": "Start date must be before end date"}

    try:
        hist = yf.download(
            ticker,
            start=start_dt.strftime("%Y-%m-%d"),
            end=end_dt.strftime("%Y-%m-%d"),
            progress=False,
            auto_adjust=True,
        )
    except Exception as exc:
        return {"status": "error", "message": f"Data fetch failed: {exc}"}

    if hist is None or hist.empty:
        return {
            "status": "error",
            "message": "No data returned for ticker/date range",
        }

    prices_series = None
    if isinstance(hist.columns, pd.MultiIndex):
        if ("Close", ticker) in hist.columns:
            prices_series = hist[("Close", ticker)]
        else:
            close_candidates = [col for col in hist.columns if str(col[0]).lower() == "close"]
            if close_candidates:
                prices_series = hist[close_candidates[0]]
    else:
        if "Close" in hist.columns:
            prices_series = hist["Close"]

    if prices_series is None:
        return {
            "status": "error",
            "message": "Unable to determine closing prices for ticker",
        }

    if isinstance(prices_series, pd.DataFrame):
        if prices_series.shape[1] == 1:
            prices = prices_series.iloc[:, 0]
        else:
            return {
                "status": "error",
                "message": "Ambiguous closing price data returned",
            }
    else:
        prices = prices_series

    prices = prices.dropna()
    if prices.empty:
        return {"status": "error", "message": "No closing prices available"}

    buy_price = float(prices.iloc[0])
    sell_price = float(prices.iloc[-1])
    shares = capital / buy_price if buy_price > 0 else 0.0

    series: List[Dict[str, Any]] = []
    for idx, price in prices.items():
        value = float(price) * shares
        date_str = idx.strftime("%Y-%m-%d") if hasattr(idx, "strftime") else str(idx)
        series.append(
            {
                "date": date_str,
                "price": float(price),
                "value": round(value, 2),
            }
        )

    final_value = shares * sell_price
    total_return_pct = (
        ((final_value - capital) / capital) * 100.0 if capital else 0.0
    )

    return {
        "status": "success",
        "data": {
            "buy_price": round(buy_price, 4),
            "sell_price": round(sell_price, 4),
            "final_value": round(final_value, 2),
            "total_return_pct": round(total_return_pct, 2),
            "series": series,
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
