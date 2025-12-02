from datetime import datetime
from typing import Any, Dict, List
import os
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from db_supabase.db_util import (
    add_user,
    login_user,
    get_user_by_email as get_user_by_email_service,
    send_verification_email as send_verification_email_service,
    verify_email as verify_email_service,
    is_user_verified as user_verified,
    get_user_by_id as get_user,
    upload_profile_picture_by_user_id,
    update_user_profile,
    send_password_reset_email as send_password_reset_email_service,
    verify_password_reset_code as verify_password_reset_code_service,
    reset_password as reset_password_service,
)

from db_supabase.db_lessons import (
    get_lesson,
    get_lessons_by_level,
)

from db_supabase.db_level_user_progress_util import (
    get_user_learning_progress,
    add_learning_user,
    set_user_learning_progress,
    set_user_completed_lessons,
    parse_completed_lessons,
)

from db_supabase.db_quiz import(
    get_quiz
)

from db_supabase.db_drag_and_drop import (
    get_drag_and_drop,
)

from db_supabase.db_strategy_storage_util import (
    save_strategy,
    get_all_strategies_by_user,
    update_strategy,
    delete_strategy,
    get_strategy_by_id,
)

try:
    import yfinance as yf
except Exception:
    yf = None

import pandas as pd
import numpy as np


app = FastAPI()

# Get allowed origins from environment variable
# For production, set ALLOWED_ORIGINS as comma-separated list of URLs
# Example: ALLOWED_ORIGINS=https://yourapp.vercel.app,https://www.yourapp.com
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    # Split by comma and strip whitespace
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
else:
    # Default to allow all origins for development
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post ("/api/get_quiz")
async def get_quiz_root(request: Request):
    data = await request.json()
    level = data.get("level")
    lesson = data.get("lesson")
    if not level:
        return {"status": "error", "message": "No level"}
    if not lesson:
        return {"status": "error", "message": "No lesson"}
    try:
        quizInfo = get_quiz(level,lesson);
        if not quizInfo:
            return {"status": "error", "message": "No quiz found"}
        return {"status": "success", "data": quizInfo}
    except Exception as e:
        print("Error receiving quiz", e)
        return {"status": "error", "message": str(e)}



@app.post ("/api/get_user_learning_progress")
async def get_user_learning_progress_root(request: Request):
    data = await request.json()
    # Support both keys for compatibility with existing frontend
    uid = data.get("uid") or data.get("id")
    if not uid:
        return {"status": "error", "message": "No User"}
    try:
        # Ensure user exists
        user = get_user(uid)
        if not user:
            return {"status": "error", "message": "User not found"}

        # Fetch progress; initialize if missing
        progress = get_user_learning_progress(uid)
        if not progress:
            init = add_learning_user(uid)
            if not init or not init.get("success"):
                return {"status": "error", "message": "Unable to initialize learning progress"}
            progress = init["user"]

        completed_lessons = parse_completed_lessons(
            progress.get("completed_lessons")
        )

        # Normalize response to what frontend expects
        response_data = {
            "user": user,
            "level_progress": progress.get("level_progress", 0),
            "lesson_progress": progress.get("lesson_progress", 0),
            "current_lesson_id": progress.get("current_lesson_id"),
            "completed_lessons": completed_lessons,
        }
        return {"status": "success", "data": response_data}
    except Exception as e:
        print("Error receiving user's learning progress", e)
        return {"status": "error", "message": str(e)}

@app.post ("/api/get_lesson")
async def get_lesson_root(request: Request):
    data = await request.json()
    level = data.get("level")
    lesson = data.get("lesson")
    # Allow level/lesson to be 0; only reject when missing (None)
    if level is None or lesson is None:
        return {"status": "error", "message": "No level or lesson_number"}
    try:
        result = get_lesson(level, lesson)
        if not result:
            return {"status": "error", "message": "Lesson not found"}
        # db_lessons.get_lesson returns a list; return the first matching row
        first = result[0] if isinstance(result, list) else result
        return {"status": "success", "data": first}
    
    except Exception as e:
        print("Error receiving lesson", e)
        return {"status": "error", "message": str(e)}

@app.get("/api/lessons/{level}")
async def get_lessons_for_level(level: int):
    try:
        lessons = get_lessons_by_level(level)
        if not lessons:
            # Return success with empty array instead of error - this is expected when checking if a level exists
            return {"status": "success", "data": []}
        lessons_sorted = sorted(lessons, key=lambda row: row.get("page_number", 0))
        return {"status": "success", "data": lessons_sorted}
    except Exception as e:
        print("Error fetching lessons for level", level, e)
        return {"status": "error", "message": str(e)}

@app.post("/api/add_learning_user")
async def add_learning_user_root(request: Request):
    data = await request.json()
    uid = data.get("uid")
    if not uid:
        return {"status": "error", "message": "Missing uid"}
    result = add_learning_user(uid)
    if result and result.get("success"):
        user_progress = result.get("user", {})
        response_data = {
            "user": {"id": user_progress.get("id")},
            "level_progress": user_progress.get("level_progress", 0),
            "lesson_progress": user_progress.get("lesson_progress", 0),
            "last_updated": user_progress.get("last_updated"),
            "completed_lessons": parse_completed_lessons(
                user_progress.get("completed_lessons", [])
            ),
        }
        # Include both keys for compatibility with varying frontend checks
        return {"status": "success", "success": "success", "data": response_data}
    return {"status": "error", "message": result.get("message") if isinstance(result, dict) else "Failed to add learning user"}


@app.post("/api/set_user_learning_progress")
async def set_user_learning_progress_root(request: Request):
    data = await request.json()
    uid = data.get("uid")
    level_progress = data.get("level_progress")
    lesson_progress = data.get("lesson_progress")
    completed_lessons_raw = data.get("completed_lessons")

    if not uid:
        return {"status": "error", "message": "Missing uid"}
    if level_progress is None or lesson_progress is None:
        return {"status": "error", "message": "Missing level or lesson progress"}

    try:
        completed_lessons = None
        if completed_lessons_raw is not None:
            completed_lessons = parse_completed_lessons(completed_lessons_raw)

        updated = set_user_learning_progress(
            uid,
            int(level_progress),
            int(lesson_progress),
            completed_lessons,
        )
        if not updated:
            return {"status": "error", "message": "Unable to update learning progress"}
        return {
            "status": "success",
            "data": {
                **updated,
                "completed_lessons": parse_completed_lessons(
                    updated.get("completed_lessons")
                ),
            },
        }
    except Exception as e:
        print("Error updating user learning progress", e)
        return {"status": "error", "message": str(e)}


@app.post("/api/set_user_completed_lessons")
async def set_user_completed_lessons_root(request: Request):
    data = await request.json()
    uid = data.get("uid")
    completed_lessons_raw = data.get("completed_lessons")

    if not uid:
        return {"status": "error", "message": "Missing uid"}

    completed_lessons = parse_completed_lessons(completed_lessons_raw)

    try:
        updated = set_user_completed_lessons(uid, completed_lessons)
        if not updated:
            return {"status": "error", "message": "Unable to update completed lessons"}
        return {
            "status": "success",
            "data": {
                **updated,
                "completed_lessons": parse_completed_lessons(
                    updated.get("completed_lessons")
                ),
            },
        }
    except Exception as e:
        print("Error updating user completed lessons", e)
        return {"status": "error", "message": str(e)}

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

@app.post("/api/get_user_id")
async def get_user_id_root(request: Request):
    data = await request.json()
    email = (data.get("email") or "").strip().lower()
    if not email:
        return {"status": "error", "message": "Missing email"}
    user = get_user_by_email_service(email)
    if not user:
        return {"status": "error", "message": "User not found"}
    return {"status": "success", "data": {"id": user["id"]}}

@app.post("/api/forgot_password")
async def forgot_password_root(request: Request):
    """Request a password reset code"""
    try:
        data = await request.json()
        email = (data.get("email") or "").strip().lower()
        if not email:
            return {"status": "error", "message": "Missing email"}
        
        result = send_password_reset_email_service(email)
        if result.get("success"):
            return {"status": "success", "data": result}
        else:
            return {"status": "error", "message": result.get("message", "Failed to send reset email")}
    except Exception as e:
        print(f"Error in forgot_password: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/api/verify_reset_code")
async def verify_reset_code_root(request: Request):
    """Verify the password reset code"""
    try:
        data = await request.json()
        email = (data.get("email") or "").strip().lower()
        reset_code = data.get("reset_code")
        
        if not email:
            return {"status": "error", "message": "Missing email"}
        if not reset_code:
            return {"status": "error", "message": "Missing reset code"}
        
        try:
            reset_code_int = int(reset_code)
        except ValueError:
            return {"status": "error", "message": "Invalid reset code format"}
        
        is_valid = verify_password_reset_code_service(email, reset_code_int)
        if is_valid:
            return {"status": "success", "data": {"valid": True}}
        else:
            return {"status": "error", "message": "Invalid or expired reset code"}
    except Exception as e:
        print(f"Error verifying reset code: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/api/reset_password")
async def reset_password_root(request: Request):
    """Reset password using the reset code"""
    try:
        data = await request.json()
        email = (data.get("email") or "").strip().lower()
        reset_code = data.get("reset_code")
        new_password = data.get("new_password")
        
        if not email:
            return {"status": "error", "message": "Missing email"}
        if not reset_code:
            return {"status": "error", "message": "Missing reset code"}
        if not new_password:
            return {"status": "error", "message": "Missing new password"}
        
        if len(new_password) < 6:
            return {"status": "error", "message": "Password must be at least 6 characters"}
        
        try:
            reset_code_int = int(reset_code)
        except ValueError:
            return {"status": "error", "message": "Invalid reset code format"}
        
        result = reset_password_service(email, reset_code_int, new_password)
        if result.get("success"):
            return {"status": "success", "data": result}
        else:
            return {"status": "error", "message": result.get("message", "Failed to reset password")}
    except Exception as e:
        print(f"Error resetting password: {e}")
        return {"status": "error", "message": str(e)}


# In main.py
@app.post("/api/update_profile")
async def update_profile_root(request: Request):
    try:
        data = await request.json()
        uid = data.get("user_id")  # Changed from "uid" to "user_id" to match frontend
        name = data.get("name")
        profile_image = data.get("profileImage")  # This will be a base64 string
        
        if not uid:
            return {"status": "error", "message": "User ID is required"}

        # Prepare updates dictionary
        updates = {}
        
        # Add name to updates if provided
        if name is not None:
            updates["username"] = name
            
        # Add profile image to updates if provided
        if profile_image:
            updates["profile_image"] = profile_image
        
        # Use the new update_user_profile function to handle the update
        result = update_user_profile(uid, updates)
        
        if not result.get("success"):
            return {"status": "error", "message": result.get("message", "Failed to update profile")}
            
        return {
            "status": "success", 
            "data": {
                "id": result["data"]["id"],
                "username": result["data"]["username"],
                "profile_image": result["data"]["profile_image"],
                "email": result["data"]["email"]
            }
        }

    except Exception as e:
        print(f"Error in update_profile_root: {str(e)}")
        return {"status": "error", "message": f"An error occurred: {str(e)}"}


@app.get("/api/market-news/latest")
async def get_latest_market_news(limit: int = 10):
    if yf is None:
        print("ERROR: yfinance is not installed")
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Server missing yfinance. Install backend requirements.",
            },
        )

    # List of popular tickers to fetch news from
    popular_tickers = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META']
    
    all_news = []
    
    for ticker in popular_tickers:
        try:
            print(f"Fetching news for ticker: {ticker}")
            ticker_obj = yf.Ticker(ticker)
            news = ticker_obj.get_news(count=5, tab="all")

            # Get ticker info for price data
            ticker_info = ticker_obj.info
            current_price = ticker_info.get('regularMarketPrice', 0)
            change = ticker_info.get('regularMarketChange', 0)
            change_percent = ticker_info.get('regularMarketChangePercent', 0)
            
            if not news:
                continue
                
            current_time = int(time.time())
            
            for article in news:
                content = article.get('content', {})
                provider = content.get('provider', {})
                pub_date = content.get("pubDate")
                
                publish_time = current_time
                
                if pub_date and isinstance(pub_date, (int, float)):
                    publish_time = int(pub_date)
                elif pub_date and isinstance(pub_date, str):
                    try:
                        if pub_date.endswith('Z'):
                            pub_date = pub_date[:-1] + '+00:00'
                        elif '+' not in pub_date and 'Z' not in pub_date:
                            pub_date += '+00:00'
                        dt = datetime.fromisoformat(pub_date)
                        publish_time = int(dt.timestamp())
                    except (ValueError, AttributeError) as e:
                        print(f"Error parsing date '{pub_date}': {str(e)}")
                        if 'providerPublishTime' in article and article['providerPublishTime']:
                            publish_time = article['providerPublishTime']
                
                all_news.append({
                    "title": content.get("title", "No title available"),
                    "publisher": provider.get("displayName", "Unknown source"),
                    "link": content.get("canonicalUrl", {}).get("url", "#"),
                    "publish_time": publish_time,
                    "published_at": datetime.fromtimestamp(publish_time).strftime('%Y-%m-%d %H:%M:%S'),
                    "type": content.get("type", "news"),
                    "ticker": ticker,
                    "ticker_name": ticker_obj.info.get('shortName', ticker) if hasattr(ticker_obj, 'info') else ticker,
                    "price": f"${current_price:.2f}",
                    "change": f"{'+' if change >= 0 else '-'}{change:.2f}",
                    "changePercent": f"{'+' if change_percent >= 0 else '-'}{change_percent:.2f}%"
                })
                
        except Exception as e:
            print(f"Error fetching news for {ticker}: {str(e)}")
            continue
    
    # Sort all news by publish time (newest first)
    all_news.sort(key=lambda x: x['publish_time'], reverse=True)
    
    # Remove duplicates based on title
    seen_titles = set()
    unique_news = []
    for article in all_news:
        title = article['title'].lower()
        if title not in seen_titles:
            seen_titles.add(title)
            unique_news.append(article)
    
    # Apply limit
    return {
        "status": "success", 
        "data": unique_news[:limit]
    }

@app.post("/api/strategies/save")
async def save_strategy_root(request: Request):
    try:
        data = await request.json()
        user_id = data.get("user_id")
        strategy_name = data.get("strategy_name")
        ticker = data.get("ticker")
        strategy_type = data.get("strategy_type")
        capital = data.get("capital")
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        metadata = data.get("metadata", {})

        if not user_id:
            return {"status": "error", "message": "User ID is required"}
        if not ticker or not strategy_type or not start_date or not end_date:
            return {"status": "error", "message": "Missing required fields"}
        
        try:
            capital_value = int(float(capital))
        except (TypeError, ValueError):
            return {"status": "error", "message": "Invalid capital amount"}

        # Add strategy_name to metadata if provided
        if strategy_name:
            metadata["strategy_name"] = strategy_name

        result = save_strategy(
            user_id=user_id,
            ticker_name=ticker,
            strategy_type=strategy_type,
            money_invested=capital_value,
            start_date=start_date,
            end_date=end_date,
            metadata=metadata
        )

        if result:
            return {"status": "success", "data": result}
        else:
            return {"status": "error", "message": "Failed to save strategy"}

    except Exception as e:
        print(f"Error saving strategy: {str(e)}")
        return {"status": "error", "message": f"An error occurred: {str(e)}"}


@app.get("/api/strategies/user/{user_id}")
async def get_user_strategies(user_id: str):
    try:
        strategies = get_all_strategies_by_user(user_id)
        return {"status": "success", "data": strategies}
    except Exception as e:
        print(f"Error getting user strategies: {str(e)}")
        return {"status": "error", "message": f"An error occurred: {str(e)}"}


@app.delete("/api/strategies/{strategy_id}")
async def delete_strategy_root(strategy_id: str):
    try:
        result = delete_strategy(strategy_id)
        if result:
            return {"status": "success", "message": "Strategy deleted successfully"}
        else:
            return {"status": "error", "message": "Strategy not found"}
    except Exception as e:
        print(f"Error deleting strategy: {str(e)}")
        return {"status": "error", "message": f"An error occurred: {str(e)}"}


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
        return {"status": "error", "message": "Buy date must be before sell date"}

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

@app.post("/api/strategies/simple_moving_average_crossover")
async def run_simple_moving_average_crossover(request: Request):
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
    short_window = int(payload.get("short_window", 100)) #if value is not given, default value is 100
    long_window = int(payload.get("long_window", 250)) #if value is not given, default value is 250

    # Validate window sizes
    if short_window >= long_window:
        return {"status": "error", "message": "Short window must be less than long window"}
    if short_window <= 0 or long_window <= 0:
        return {"status": "error", "message": "Window sizes must be positive integers"}

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

    # Validate data length
    if len(prices) < long_window:
        return {
            "status": "error",
            "message": f"Insufficient data: need at least {long_window} trading days, got {len(prices)}",
        }

    short_moving_average = prices.rolling(window=short_window).mean()
    long_moving_average = prices.rolling(window=long_window).mean()

    signal = (short_moving_average > long_moving_average).astype(int)
    signal_shifted = signal.shift(1).fillna(0)

    daily_returns = prices.pct_change().fillna(0)
    strategy_returns = daily_returns * signal_shifted

    equity_curve = (1 + strategy_returns).cumprod() * capital

    series = []
    for idx, price in prices.items():
        if hasattr(idx, "strftime"):
            date_str = idx.strftime("%Y-%m-%d")
        else:
            date_str = str(idx)
        if not pd.isna(short_moving_average.loc[idx]):
            ma_short = short_moving_average.loc[idx]
        else:
            ma_short = None
        if not pd.isna(long_moving_average.loc[idx]):
            ma_long = long_moving_average.loc[idx]
        else:
            ma_long = None

        # Use signal_shifted to reflect the actual position used for returns
        signal_val = int(signal_shifted.loc[idx])
        equity_val = round(equity_curve.loc[idx], 2)
        series.append(
            {
                "date": date_str,
                "price": float(price),
                "short_ma": float(ma_short) if ma_short is not None else None,
                "long_ma": float(ma_long) if ma_long is not None else None,
                "signal": signal_val,
                "value": equity_val,
            }
        )

    final_value = float(equity_curve.iloc[-1])
    total_return_pct = (
        ((final_value - capital) / capital) * 100.0 if capital else 0.0
    )

    return {
        "status": "success",
        "data": {
            "short_window": short_window,
            "long_window": long_window,
            "final_value": round(final_value, 2),
            "total_return_pct": round(total_return_pct, 2),
            "series": series,
        },
    }

@app.post("/api/strategies/dca")
async def run_dollar_cost_average(request: Request):
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
    frequency = (payload.get("frequency") or "monthly").lower()
    contribution_raw = payload.get("contribution")

    try:
        capital = float(capital_raw)
        if capital <= 0:
            raise ValueError
    except Exception:
        return {"status": "error", "message": "Invalid capital amount"}

    contribution = None
    if contribution_raw is not None:
        try:
            contribution = float(contribution_raw)
            if contribution <= 0:
                raise ValueError
        except Exception:
            return {"status": "error", "message": "Invalid contribution amount"}

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
        return {"status": "error", "message": "Buy date must be before sell date"}

    try:
        hist = yf.download(
            ticker,
            start=start_dt.strftime("%Y-%m-%d"),
            end=end_dt.strftime("%Y-%m-%d"),
            progress=False,
            auto_adjust=True,
        )
    except Exception as e:
        return {"status": "error", "message": f"Data fetch failed: {e}"}

    if hist is None or hist.empty:
        return {"status": "error", "message": "No data returned for ticker/date range"}

    prices = hist["Close"]
    if isinstance(prices, pd.DataFrame):
        prices = prices.iloc[:, 0]
    prices = prices.dropna()

    if prices.empty:
        return {"status": "error", "message": "No closing price data available"}

    if frequency == "weekly":
        buy_dates = pd.date_range(start_dt, end_dt, freq="W")
    elif frequency == "biweekly":
        buy_dates = pd.date_range(start_dt, end_dt, freq="2W")
    elif frequency == "monthly":
        buy_dates = pd.date_range(start_dt, end_dt, freq="M")
    else:
        return {"status": "error", "message": "Invalid frequency."}

    trading_days = prices.index

    mapped_buy_dates = []
    for d in buy_dates:
        valid_days = trading_days[trading_days <= d]
        if len(valid_days) > 0:
            mapped_buy_dates.append(valid_days[-1])

    buy_dates = list(dict.fromkeys(mapped_buy_dates))

    if not buy_dates:
        return {"status": "error", "message": "No valid DCA buy dates available in price data"}


    if contribution is None:
        contribution = capital / len(buy_dates)

    total_contributed = 0.0
    total_shares = 0.0

    equity_curve = []
    series = []

    for date, price in prices.items():
        if hasattr(date, "strftime"):
            date_str = date.strftime("%Y-%m-%d")
        else:
            date_str = str(date)

        if date in buy_dates and total_contributed < capital:
            amount = min(contribution, capital - total_contributed)
            shares_bought = amount / price
            total_shares += shares_bought
            total_contributed += amount

        portfolio_value = total_shares * price

        series.append({
            "date": date_str,
            "price": float(price),
            "shares": float(total_shares),
            "contributed": round(total_contributed, 2),
            "value": round(portfolio_value, 2),
            "signal": 1 if date in buy_dates else 0,
        })

    final_value = series[-1]["value"]
    if total_contributed > 0:
        total_return_pct = ((final_value - total_contributed) / total_contributed * 100)
    else:
        total_contributed = 0

    return {
        "status": "success",
        "data": {
            "frequency": frequency,
            "contribution": round(contribution, 2),
            "total_contributed": round(total_contributed, 2),
            "final_value": round(final_value, 2),
            "total_return_pct": round(total_return_pct, 2),
            "series": series,
        },
    }

@app.get("/api/ticker/{ticker}/news")
async def get_ticker_news(ticker: str):
    if yf is None:
        print("ERROR: yfinance is not installed")
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Server missing yfinance. Install backend requirements.",
            },
        )

    ticker_upper = ticker.upper().strip()
    if not ticker_upper:
        return {"status": "error", "message": "Invalid ticker"}

    try:
        print(f"Fetching news for ticker: {ticker_upper}")
        ticker_obj = yf.Ticker(ticker_upper)
        
        print(f"Ticker info available: {hasattr(ticker_obj, 'info')}")
        
        news = ticker_obj.get_news(count=5, tab="all")
        print(f"Raw news data: {news}")
        
        if not news:
            print(f"No news found for {ticker_upper}")
            try:
                print("Trying alternative news fetch method...")
                hist = ticker_obj.history(period="1d")
                if hist.empty:
                    print("No historical data available")
                else:
                    print("Historical data available, but no news found")
            except Exception as e:
                print(f"Alternative fetch error: {str(e)}")
            
            return {"status": "success", "data": []}
        
        formatted_news = []
        current_time = int(time.time())
        for article in news:
            content = article.get('content', {})
            provider = content.get('provider', {})
            pub_date = content.get("pubDate")
            
            publish_time = current_time
            
            if pub_date and isinstance(pub_date, (int, float)):
                publish_time = int(pub_date)
            elif pub_date and isinstance(pub_date, str):
                try:
                    if pub_date.endswith('Z'):
                        pub_date = pub_date[:-1] + '+00:00'
                    elif '+' not in pub_date and 'Z' not in pub_date:
                        pub_date += '+00:00'
                    dt = datetime.fromisoformat(pub_date)
                    publish_time = int(dt.timestamp())
                except (ValueError, AttributeError) as e:
                    print(f"Error parsing date '{pub_date}': {str(e)}")
                    if 'providerPublishTime' in article and article['providerPublishTime']:
                        publish_time = article['providerPublishTime']
                
            formatted_news.append({
                "title": content.get("title", "No title available"),
                "publisher": provider.get("displayName", "Unknown source"),
                "link": content.get("canonicalUrl", {}).get("url", "#"),
                "publish_time": publish_time,
                "published_at": datetime.fromtimestamp(publish_time).strftime('%Y-%m-%d %H:%M:%S'),
                "type": content.get("type", "news"),
            })
        
        print(f"Formatted {len(formatted_news)} news articles")
        return {"status": "success", "data": formatted_news}
    except Exception as e:
        error_msg = f"Error fetching news for {ticker_upper}: {str(e)}"
        print(error_msg)
        return {"status": "error", "message": error_msg}

@app.post("/api/get_drag_and_drop")
async def get_drag_and_drop_root(request: Request):
    data = await request.json()
    level = data.get("level")
    lesson = data.get("lesson")
    
    if level is None:
        return {"status": "error", "message": "No level"}
    if lesson is None:
        return {"status": "error", "message": "No lesson"}
    
    try:
        import json
        dragAndDropInfo = get_drag_and_drop(level, lesson)
        
        if not dragAndDropInfo:
            print(f"No drag and drop found for level {level}, lesson {lesson}")
            return {"status": "error", "message": "No drag and drop found"}
        
        fields_to_parse = ["options", "selections_titles", "selection_titles", "selection1", "selection2", "selections"]
        for field in fields_to_parse:
            if field in dragAndDropInfo and isinstance(dragAndDropInfo[field], str):
                try:
                    dragAndDropInfo[field] = json.loads(dragAndDropInfo[field])
                except (json.JSONDecodeError, TypeError):
                    
                    pass
           
        return {"status": "success", "data": dragAndDropInfo}
        
    except Exception as e:
        print("Error receiving drag and drop", e)
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

@app.get("/api/ticker/{ticker}/history")
async def get_ticker_history(ticker: str, period: str = "1mo", interval: str = "1d"):
    if yf is None:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Server missing yfinance. Install backend requirements.",
            },
        )

    ticker_upper = ticker.upper().strip()
    if not ticker_upper:
        return {"status": "error", "message": "Invalid ticker"}

    try:
        ticker_obj = yf.Ticker(ticker_upper)
        hist = ticker_obj.history(period=period, interval=interval)
        
        if hist is None or hist.empty:
            return {"status": "error", "message": "No historical data available"}
        
        history_data = []
        for idx, row in hist.iterrows():
            history_data.append({
                "date": idx.strftime("%Y-%m-%d %H:%M:%S"),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": int(row["Volume"]) if not pd.isna(row["Volume"]) else 0
            })
            
        return {
            "status": "success",
            "data": {
                "ticker": ticker_upper,
                "history": history_data
            }
        }
    except Exception as e:
        return {"status": "error", "message": f"Error fetching history: {str(e)}"}

@app.post("/api/strategies/buy_hold_markers")
async def run_buy_and_hold_markers(request: Request):
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
    capital = float(payload.get("capital", 1000))
    commission_dollars = float(payload.get("commission_dollars", 0))
    position_percent = float(payload.get("position_percent", 100))

    if not ticker or not start_date or not end_date:
        return {"status": "error", "message": "Missing required fields"}

    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
    except Exception:
        return {"status": "error", "message": "Invalid date format. Use YYYY-MM-DD"}

    if start_dt >= end_dt:
        return {"status": "error", "message": "Buy date must be before sell date"}

    try:
        hist = yf.download(
            ticker,
            start=start_dt.strftime("%Y-%m-%d"),
            end=end_dt.strftime("%Y-%m-%d"),
            progress=False,
            auto_adjust=True,
        )
    except Exception as e:
        return {"status": "error", "message": f"Data fetch failed: {e}"}

    if hist is None or hist.empty:
        return {"status": "error", "message": "No data returned for ticker/date range"}

    if isinstance(hist.columns, pd.MultiIndex):
        possible = [c for c in hist.columns if c[0].lower() == "close"]
        if not possible:
            return {"status": "error", "message": "Unable to find closing prices (multi-index)"}
        prices = hist[possible[0]]
    else:
        if "Close" not in hist.columns:
            return {"status": "error", "message": "Unable to find closing prices"}
        prices = hist["Close"]

    prices = prices.dropna()
    if prices.empty:
        return {"status": "error", "message": "No valid closing prices"}

    buy_price = float(payload.get("entry_price")) if payload.get("entry_price") else float(prices.iloc[0])
    sell_price = float(payload.get("exit_price")) if payload.get("exit_price") else float(prices.iloc[-1])

    position_capital = capital * (position_percent / 100.0)

    shares = position_capital / buy_price if buy_price > 0 else 0.0

    gross_value = shares * sell_price
    gross_pl = gross_value - position_capital

    total_trading_costs = commission_dollars * 2
    net_pl = gross_pl - total_trading_costs
    final_value = position_capital + net_pl     

    total_return_pct = ((final_value - position_capital) / position_capital) * 100.0 if position_capital > 0 else 0.0

    series = []
    first_price = prices.iloc[0]
    last_price = prices.iloc[-1]

    for idx, price in prices.items():
        series.append({
            "date": idx.strftime("%Y-%m-%d"),
            "price": float(price),
            "value": round(float(price) * shares, 2),
            "is_entry": bool(price == first_price),
            "is_exit": bool(price == last_price),
            "shares": float(shares),
        })

    return {
        "status": "success",
        "data": {
            "buy_price": round(buy_price, 4),
            "sell_price": round(sell_price, 4),
            "final_value": round(final_value, 2),
            "total_return_pct": round(total_return_pct, 2),
            "shares": round(shares, 6),
            "commission_dollars": round(commission_dollars, 2),
            "position_percent": round(position_percent, 2),
            "trading_costs": round(total_trading_costs, 2),
            "series": series,
        },
    }

if __name__ == "__main__":
    import uvicorn

    # Get port from environment variable, default to 8000
    # Railway and other platforms set PORT automatically
    port = int(os.getenv("PORT", "8000"))
    # Only enable reload in development
    reload = os.getenv("ENVIRONMENT", "development").lower() == "development"
    
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload)