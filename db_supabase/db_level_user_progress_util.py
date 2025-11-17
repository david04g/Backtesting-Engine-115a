import os
import json
from typing import List, Optional

import dotenv
from supabase import Client, create_client
from datetime import datetime, timezone

dotenv.load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PASS = os.getenv("SUPABASE_PASS")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_PASS)

def get_current_timestamp():
    return datetime.now(timezone.utc).isoformat()

def verify_uid_exists(uid: str):
    response = str(supabase.table("users").select("*").eq("id", uid).execute())
    if "data=[]" in response:
        return False
    else:
        return True
    
def add_learning_user(uid: str):
    if not verify_uid_exists(uid):
        print("User ID does not exist")
        return None
    try:
        response = supabase.table("user_progress").insert({
            "id": uid,
            "level_progress": 0,
            "lesson_progress": 1,
            "last_updated": get_current_timestamp()
        }).execute()
        if response.data:
            return {"success": True, "user": response.data[0]}
        else:
            return {"success": False, "message": "failed to add user"}
    except Exception as e:
        if "duplicate key value violates unique constraint" in str(e).lower():
            return {"success": False, "message": "user already exists"}
        else:
            return {"success": False, "message": f"error adding user: {e}"}
        
def set_user_learning_progress(
    uid: str,
    level_progress: int,
    lesson_progress: int,
    completed_lessons: Optional[List[int]] = None,
):
    try:
        update_data = {
            "level_progress": level_progress,
            "lesson_progress": lesson_progress,
            "last_updated": get_current_timestamp(),
        }
        if completed_lessons is not None:
            update_data["completed_lessons"] = completed_lessons

        response = supabase.table("user_progress").update(update_data).eq("id", uid).execute()
        if not response.data:
            print("User does not exist")
            return None
        return response.data[0]
    except Exception as e:
        print("Failed to update user learning progress:", e)
        return None


def set_user_completed_lessons(uid: str, completed_lessons: List[int]):
    try:
        response = supabase.table("user_progress").update({
            "completed_lessons": completed_lessons,
            "last_updated": get_current_timestamp(),
        }).eq("id", uid).execute()

        if response.data:
            return response.data[0]

        init = add_learning_user(uid)
        if not init or not init.get("success"):
            return None

        retry_response = supabase.table("user_progress").update({
            "completed_lessons": completed_lessons,
            "last_updated": get_current_timestamp(),
        }).eq("id", uid).execute()

        if retry_response.data:
            return retry_response.data[0]
        return None
    except Exception as e:
        print("Failed to update user completed lessons:", e)
        return None


def parse_completed_lessons(raw_value):
    if isinstance(raw_value, list):
        return raw_value
    if isinstance(raw_value, str):
        try:
            parsed = json.loads(raw_value)
            if isinstance(parsed, list):
                return parsed
        except json.JSONDecodeError:
            pass
    return []
    
def get_user_learning_progress(id: str):
    response = supabase.table("user_progress").select("*").eq("id", id).execute()
    if response.data:
        return response.data[0]
    else:
        return None

def get_user_level_progress(uid: str):
    response = supabase.table("user_progress").select("*").eq("id", uid).execute()
    if response.data:
        return response.data[0]["level_progress"]
    else:
        return None
    
def get_user_lesson_progress(uid: str):
    response = supabase.table("user_progress").select("*").eq("id", uid).execute()
    if response.data:
        return response.data[0]["lesson_progress"]
    else:
        return None
    
def increment_user_level(uid: str):
    try:
        user_level = get_user_level_progress(uid)
        user_level += 1
        response = supabase.table("user_progress").update({"level_progress": user_level, "last_updated": get_current_timestamp()}).eq("id", uid).execute()
        if "data=[]" in str(response):
            print("User does not exist")
            return None
        else:
            return response
    except Exception as e:
        print("Failed to update user learning progress")
        return None

def increment_user_lesson(uid: str):
    try:
        user_lesson = get_user_lesson_progress(uid)
        user_lesson += 1
        response = supabase.table("user_progress").update({"lesson_progress": user_lesson, "last_updated": get_current_timestamp()}).eq("id", uid).execute()
        if "data=[]" in str(response):
            print("User does not exist")
            return None
        else:
            return response
    except Exception as e:
        print("Failed to update user learning progress")
        return None
    
def reset_user_level(uid: str):
    try:
        response = supabase.table("user_progress").update({"level_progress": 1}).eq("id", uid).execute()
        if "data=[]" in str(response):
            print("User does not exist")
            return None
        else:
            return response
    except Exception as e:
        print("Failed to update user learning progress")
        return None

def increment_user_lesson_and_reset_user_level(uid: str):
    if verify_uid_exists(uid) is False:
        print("User does not exist")
        return None
    try:
        current_lesson = get_user_lesson_progress(uid)
        if current_lesson is None:
            print("User progress not found")
            return None
        incremented_lesson = current_lesson + 1
        response = supabase.table("user_progress").update({"level_progress": 1, "lesson_progress": incremented_lesson, "last_updated": get_current_timestamp()}).eq("id", uid).execute()
        if not response.data:
            print("User does not exist")
            return None
        else:
            return response
    except Exception as e:
        print("Failed to update user learning progress: {e}")
        return None
