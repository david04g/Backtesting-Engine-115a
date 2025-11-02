import os
import dotenv
from supabase import Client, create_client
import bcrypt
dotenv.load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PASS = os.getenv("SUPABASE_PASS")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_PASS)

def add_user(username: str, email: str, password_plain: str):
    try:
        password_hash = bcrypt.hashpw(password_plain.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        response = supabase.table("users").insert({
            "username": username,
            "email": email,
            "password_hash": password_hash
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

def login_user(email: str, password_plain: str):
    try:
      
        response = supabase.table("users").select("*").eq("email", email).execute()

        if not response.data or len(response.data) == 0:
            return {"success": False, "message": "User not found"}

        user = response.data[0]
        stored_hash = user["password_hash"]


        if bcrypt.checkpw(password_plain.encode("utf-8"), stored_hash.encode("utf-8")):
            return {"success": True, "user": user}
        else:
            return {"success": False, "message": "Invalid password"}

    except Exception as e:
        return {"success": False, "message": f"Error logging in: {e}"}


def get_user_by_id(uid: int):
    response = supabase.table("users").select("*").eq("id", uid).execute()
    if response.data:
        return response.data[0]
    else:
        return None
    
def get_user_by_username(username: int):
    response = supabase.table("users").select("*").eq("username", username).execute()
    if response.data:
        return response.data[0]
    else:
        return None

def get_all_users():
    response = supabase.table("users").select("*").execute()
    return response.data if response.data else []


def delete_user_by_username(username: str):
    response = supabase.table("users").delete().eq("username", username).execute()
    return {"deleted": len(response.data)} if response.data else {"deleted": 0}

def delete_user_by_id(uid: int):
    response = supabase.table("users").delete().eq("id", uid).execute()
    return {"deleted": len(response.data)} if response.data else {"deleted": 0}