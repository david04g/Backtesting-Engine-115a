import os
import dotenv
from supabase import Client, create_client
from typing import List, Dict, Any, Optional

dotenv.load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PASS = os.getenv("SUPABASE_PASS")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_PASS)

def get_quiz(level:int, lesson: int):
    try:
        response = (
        supabase.table("quiz")
        .select("*")
        .eq("level", level)
        .eq("lesson", lesson)
        .limit(1)
        .execute()
        )
        if response.data:
            return response.data[0]

        return []
    except Exception as e:
        print("Error fetching all lessons: ", e)
        return None 
