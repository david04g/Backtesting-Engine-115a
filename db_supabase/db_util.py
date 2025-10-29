import os
import dotenv
from supabase import Client, create_client
import bcrypt
import imghdr
import mimetypes
import secrets
import smtplib
from email.mime.text import MIMEText

dotenv.load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PASS = os.getenv("SUPABASE_PASS")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_PASS)

#note: when creating an account, it will be assigned an account creation time. this, by default,
#will be in UTC-0 (Greenwich) time. subtract by 8 hours to get UTC-8 (PST) time
def add_user(username: str, email: str, password_plain: str):
    try:
        password_hash = bcrypt.hashpw(password_plain.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        verification_token = secrets.token_urlsafe(32)
        response = supabase.table("users").insert({
            "username": username,
            "email": email,
            "password_hash": password_hash,
            #insert default pfp
            "profile_image": "https://qlgyxqafprlghppeqjrk.supabase.co/storage/v1/object/public/profile-pictures/default_profile_image.png",
            "verification_token": verification_token
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
    
def get_user_by_username(username: str):
    response = supabase.table("users").select("*").eq("username", username).execute()
    if response.data:
        return response.data[0]
    else:
        return None

def get_all_users():
    response = supabase.table("users").select("*").execute()
    if response.data:
        return response.data
    else:
        return []

def delete_user_by_username(username: str):
    response = supabase.table("users").delete().eq("username", username).execute()
    if len(response.data) > 0:
        return True
    else:
        return False

def delete_user_by_id(uid: int):
    response = supabase.table("users").delete().eq("id", uid).execute()
    if len(response.data) > 0:
        return True
    else:
        return False

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
        #if user_{uid}.png already exists, it will replace the user_{uid}.png photo. otherwise it will upload the db to storage
        res = supabase.storage.from_(bucket).upload(file_name, f, {"upsert": "true", "content-type": mime_type})

    """
    if res:
        print("Profile picture upload failed: ", res)
        return None
    """
    #note: as of now, there is no error handling. will be added in future
    if not res.data:
        print("something went wrong uploading user profile picture")
        return None

    #build public url
    public_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/{bucket}/{file_name}"

    #updates the db
    supabase.table("users").update({"profile_image": public_url}).eq("id", uid).execute()

    return public_url

def get_user_id_by_username(username: str):
    result = get_user_by_username(username)
    return result["id"] 

def get_user_password_hash(uid: int):
    res = supabase.table("users").select("password_hash").eq("id", uid).execute()
    if res.data and len(res.data) > 0:
        return res.data[0]["password_hash"]
    return None

def verify_password(uid: int, password_attempt: str) -> bool:
    stored_hash = get_user_password_hash(uid)
    if not stored_hash:
        print("User not found or no password hash stored.")
        return False

    return bcrypt.checkpw(password_attempt.encode("utf-8"), stored_hash.encode("utf-8"))

def change_password(uid: int, old_password: str, new_password: str) -> bool:
    if not verify_password(uid, old_password):
        print("Old password is incorrect.")
        return False

    new_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    res = supabase.table("users").update({"password_hash": new_hash}).eq("id", uid).execute()

    if res.data:
        print("Password updated successfully.")
        return True
    else:
        print("Password update failed.")
        return False
    
def verify_email(token: str):
    res = supabase.table("users").select("id").eq("verification_token", token).execute()
    if not res.data:
        return "Invalid or expired token."

    uid = res.data[0]["id"]
    supabase.table("users").update({
        "email_verified": True,
        "verification_token": None
    }).eq("id", uid).execute()

    return "successfully verified email"

def send_verification_email(email, verification_link):
    msg = MIMEText(f"Click here to verify your account: {verification_link}")
    msg["Subject"] = "Verify Your Email"
    #OUR ACTUAL COMPANY EMAIL GOES HERE
    msg["From"] = "simple-strategies@gmail.com"
    msg["To"] = email

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(os.getenv("SMTP_USER"), os.getenv("SMTP_PASS"))
        server.send_message(msg)