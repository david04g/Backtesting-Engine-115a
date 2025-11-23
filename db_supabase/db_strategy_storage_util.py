import os
import dotenv
from datetime import datetime
from supabase import Client, create_client

dotenv.load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PASS = os.getenv("SUPABASE_PASS")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_PASS)

def save_strategy(user_id: str, ticker_name: str, strategy_type: str, money_invested: int, start_date: str, end_date: str, metadata: dict | None = None):
    try:
        converted_start_date = datetime.fromisoformat(start_date).date()
        converted_end_date = datetime.fromisoformat(end_date).date()
    except ValueError:
        print("Invalid date format. Use YYYY-MM-DD.")
        return None

    if converted_start_date >= converted_end_date:
        print("Start date must be before end date.")
        return None

    users_existing_strategies = (supabase.table("user_strategies").select("strategy_id").eq("user_id", user_id).execute())

    if users_existing_strategies.data is None:
        print("Could not check the user's existing strategies.")
        return None

    if len(users_existing_strategies.data) >= 5:
        print("User already has 5 strategies. Limit reached.")
        return None

    payload = {
        "user_id": user_id,
        "ticker_name": ticker_name.upper(),
        "strategy_type": strategy_type,
        "money_invested": money_invested,
        "start_date": converted_start_date.isoformat(),
        "end_date": converted_end_date.isoformat(),
        "metadata": metadata or {},
    }

    try:
        response = supabase.table("user_strategies").insert(payload).execute()
        return response.data
    except Exception as e:
        print(f"Error saving strategy for user {user_id}: {e}")
        return None

def get_all_strategies_by_user(user_id: str):
    response = supabase.table("user_strategies").select("*").eq("user_id", user_id).execute()
    if not response.data:
        print(f"No strategies found for user {user_id}.")
        return []
    return response.data

def update_strategy(strategy_id: str, updates: dict):
    if "metadata" in updates:
        existing = supabase.table("user_strategies").select("metadata").eq("strategy_id", strategy_id).execute()

        if existing.data:
            current_meta = existing.data[0].get("metadata", {}) or {}
            new_meta = {**current_meta, **updates["metadata"]}
            updates["metadata"] = new_meta

    response = (supabase.table("user_strategies").update(updates).eq("strategy_id", strategy_id).execute())

    if not response.data:
        print(f"Failed to update strategy {strategy_id}.")
        return None
    return response.data[0]

def delete_strategy(strategy_id: str):
    response = supabase.table("user_strategies").delete().eq("strategy_id", strategy_id).execute()
    if response.data:
        print(f"Strategy {strategy_id} deleted.")
    else:
        print(f"Strategy {strategy_id} not found.")
    return response.data

def delete_all_user_strategies(user_id: str) -> bool:
    try:
        existing = supabase.table("user_strategies").select("*").eq("user_id", user_id).execute()
        if not existing.data:
            print(f"No strategies found for user {user_id}.")
            return False

        response = supabase.table("user_strategies").delete().eq("user_id", user_id).execute()
        print(f"Deleted {len(response.data)} strategies for user {user_id}.")
        return True

    except Exception as e:
        print(f"Error deleting strategies for user {user_id}: {e}")
        return False