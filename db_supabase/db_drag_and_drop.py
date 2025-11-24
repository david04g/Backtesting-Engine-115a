import os
import dotenv
from supabase import Client, create_client
from typing import Optional, Dict, Any

dotenv.load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PASS = os.getenv("SUPABASE_PASS")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_PASS)

def get_drag_and_drop(level: int, lesson: int) -> Optional[Dict[str, Any]]:
    print(f"=== GET_DRAG_AND_DROP CALLED ===")
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
        print(f"Response data length: {len(response.data) if response.data else 0}")
        
        if response.data and len(response.data) > 0:
            print(f"✓ Found drag and drop data:", response.data[0])
            return response.data[0]
        
        print(f"✗ No drag and drop data found for level {level}, lesson {lesson}")
        
        # Let's also check what IS in the database
        all_data = supabase.table("Drag_and_Drop").select("*").execute()
        print(f"All drag and drop records in database: {all_data.data}")
        
        return None
    except Exception as e:
        print(f"❌ Error fetching Drag_and_Drop: {e}")
        import traceback
        traceback.print_exc()
        return None