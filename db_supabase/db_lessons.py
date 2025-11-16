import os
import dotenv
from supabase import Client, create_client
from typing import List, Dict, Any, Optional

dotenv.load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PASS = os.getenv("SUPABASE_PASS")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_PASS)

def get_lesson(level:int, lesson:int) -> List[Dict[str, Any]]:
    try:
        response = supabase.table("lessons") \
            .select("*") \
            .eq("level", level) \
            .eq("page_number", lesson) \
            .execute()
        return response.data
    except Exception as e:
        print("Error fetching all lessons: ", e)
        return []

def get_lesson_by_id(lesson_id: int):
    try:
        response = supabase.table("lessons").select("*").eq("id", lesson_id).execute()
        if response.data:
            return response.data[0]
        else:
            return []
    except Exception as e:
        print("Error fetching all lessons: ", e)
        return None 

def get_lessons_by_user(user_id: str):
    try:
        progress_response = supabase.table("user_progress").select("current_lesson_id").eq("id", user_id).execute()
        if not progress_response.data:
            print(f"No progress found for user {user_id}")
            return None

        current_lesson_id = progress_response.data[0]["current_lesson_id"]
        lesson = get_lesson_by_id(current_lesson_id)
        return lesson
    except Exception as e:
        print(f"Error fetching lesson for user {user_id}: {e}")
        return None

def get_lessons_by_level(level: int):
    try:
        response = supabase.table("lessons").select("*").eq("level", level).execute()
        return response.data
    except Exception as e:
        print(f"Error fetching lessons for level {level}:", e)
        return []

def get_lesson_by_page(page_number: int):
    try:
        response = supabase.table("lessons").select("*").eq("page_number", page_number).single().execute()
        return response.data
    except Exception as e:
        print(f"Error fetching lesson for page {page_number}:", e)
        return []
    


def get_lesson_by_title(page_title: str):
    try:
        response = supabase.table("lessons").select("*").eq("page_title", page_title).single().execute()
        return response.data
    except Exception as e:
        print(f"Error fetching lesson '{page_title}':", e)
        return []

def get_user_progress(user_id: str):
    response = supabase.table("user_progress").select("*").eq("user_id", user_id).execute()
    if response.data:
        return response.data[0]
    return []