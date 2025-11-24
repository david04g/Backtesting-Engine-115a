import os
import dotenv
from supabase import Client, create_client
from typing import Optional, Dict, Any

dotenv.load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PASS = os.getenv("SUPABASE_PASS")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_PASS)

def get_drag_and_drop(level: int, lesson: int) -> Optional[Dict[str, Any]]:
    print(f"\n=== GET_DRAG_AND_DROP CALLED ===")
    print(f"Searching for level: {level} (type: {type(level)})")
    print(f"Searching for lesson: {lesson} (type: {type(lesson)})")
    
    try:
        response = (
            supabase.table("Drag_and_Drop")
            .select("*")
            .eq("level", level)
            .eq("lesson", lesson)
            .limit(1)
            .execute()
        )
        
        print(f"Response data: {response.data}")
        print(f"Number of results: {len(response.data) if response.data else 0}")
        
        if response.data and len(response.data) > 0:
            print(f"✓ FOUND drag and drop data!")
            print(f"Data: {response.data[0]}")
            return response.data[0]
        
        print(f"✗ NO DATA FOUND for level {level}, lesson {lesson}")
        
        # Debug: Show what IS in the database
        all_data = supabase.table("Drag_and_Drop").select("level, lesson").execute()
        print(f"Available records in database:")
        for record in all_data.data:
            print(f"  - Level: {record['level']} (type: {type(record['level'])}), Lesson: {record['lesson']} (type: {type(record['lesson'])})")
        
        return None
        
    except Exception as e:
        print(f"❌ ERROR in get_drag_and_drop: {e}")
        import traceback
        traceback.print_exc()
        return None