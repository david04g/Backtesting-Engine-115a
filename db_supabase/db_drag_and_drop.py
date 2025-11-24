import os
import dotenv
from supabase import Client, create_client
from typing import Optional, Dict, Any

dotenv.load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PASS = os.getenv("SUPABASE_PASS")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_PASS)

def get_drag_and_drop(level: int, lesson: int) -> Optional[Dict[str, Any]]:

    try:
        response = (
            supabase.table("Drag_and_Drop")
            .select("*")
            .eq("level", level)
            .eq("lesson", lesson)
            .limit(1)
            .execute()
        )
        
       
        if response.data and len(response.data) > 0:
            
            return response.data[0]
        
     
        
        # Debug: Show what IS in the database
        all_data = supabase.table("Drag_and_Drop").select("level, lesson").execute()
   
        
        
        return None
        
    except Exception as e:
        print(f"ERROR in get_drag_and_drop: {e}")
        import traceback
        traceback.print_exc()
        return None