import os
import dotenv
from supabase import Client, create_client
import bcrypt
import imghdr
import mimetypes

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
            "password_hash": password_hash,
            #insert default pfp
            "profile_image": "https://qlgyxqafprlghppeqjrk.supabase.co/storage/v1/object/public/profile-pictures/default_profile_image.png"
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
            return {"success": False, "message": "User email not found"}

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

def is_image_file(path: str):
    file_type = imghdr.what(path)
    if file_type in ["jpeg", "png"]:
        return True
    else:
        return False

def upload_profile_picture_by_user_id(uid: int, file_path: str):
    bucket = "profile-pictures"
    file_name = f"user_{uid}.png"
    
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return None
    
    if not is_image_file(file_path):
        print("Invalid file type. Only image files (jpg/png) are allowed.")
        return None

    mime_type, dummy = mimetypes.guess_type(file_path)
    if mime_type is None:
        mime_type = "image/png" #fallback if fails, not sure if this is the best idea

    

    with open(file_path, "rb") as f:
        #if user_{uid}.png already exists, it will replace the user_{uid}.png photo
        res = supabase.storage.from_(bucket).upload(file_name, f, {"upsert": "true", "content-type": mime_type})

    """
    if res:
        print("Profile picture upload failed: ", res)
        return None
    """
    #note: as of now, there is no error handling. will be added in future

    #build public url
    public_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/{bucket}/{file_name}"

    #updates the db
    supabase.table("users").update({"profile_image": public_url}).eq("id", uid).execute()

    return public_url