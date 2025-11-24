import os
import dotenv
from supabase import Client, create_client
import bcrypt
import imghdr
import mimetypes
import smtplib
import random
from email.mime.text import MIMEText
from datetime import datetime, timedelta

dotenv.load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PASS = os.getenv("SUPABASE_PASS")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_PASS)

#note: when creating an account, it will be assigned an account creation time. this, by default,
#will be in UTC-0 (Greenwich) time. subtract by 8 hours to get UTC-8 (PST) time
def add_user(username: str, email: str, password_plain: str):
    try:
        email = email.strip().lower()
        username = username.strip()
        email_check = supabase.table("users").select("id").eq("email", email).execute()
        if email_check.data:
            return {"success": False, "message": "Email already in use."}

        username_check = supabase.table("users").select("id").eq("username", username).execute()
        if username_check.data:
            return {"success": False, "message": "Username already taken."}

        password_hash = bcrypt.hashpw(password_plain.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        random_int = random.randint(100000, 999999)
        verification_string = f"{random_int:06d}"
        response = supabase.table("users").insert({
            "username": username,
            "email": email,
            "password_hash": password_hash,
            #insert default pfp
            "profile_image": "https://qlgyxqafprlghppeqjrk.supabase.co/storage/v1/object/public/profile-pictures/default_profile_image.png",
            "verification_code": int(verification_string)
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
        email = email.strip().lower()
        response = supabase.table("users").select("*").eq("email", email).execute()
        if not response.data or len(response.data) == 0:
            return {"success": False, "message": "User email not found"}

        user = response.data[0]
        stored_hash = user["password_hash"]

        if not bcrypt.checkpw(password_plain.encode("utf-8"), stored_hash.encode("utf-8")):
            return {"success": False, "message": "Invalid password"}
        
        if not user.get("email_verified", False):
            return {"success": False, "message": "Email not verified. Please verify your email before logging in."}

        return {"success": True, "user": user}

    except Exception as e:
        return {"success": False, "message": f"Error logging in: {e}"}

def get_user_by_id(uid: str):
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

def get_user_by_email(email: str):
    response = supabase.table("users").select("*").eq("email", email).execute()
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

def delete_user_by_id(uid: str):
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

# def upload_profile_picture_by_user_id(uid: str, file_path: str):
#     bucket = "profile-pictures"
#     file_name = f"user_{uid}.png"
    
#     if not os.path.exists(file_path):
#         print(f"File not found: {file_path}")
#         return None
    
#     if not is_image_file(file_path):
#         print("Invalid file type. Only image files (jpg/png) are allowed.")
#         return None

#     mime_type, dummy = mimetypes.guess_type(file_path)
#     if mime_type is None:
#         mime_type = "image/png" #fallback if fails, not sure if this is the best idea

#     with open(file_path, "rb") as f:
#         #if user_{uid}.png already exists, it will replace the user_{uid}.png photo. otherwise it will upload the db to storage
#         res = supabase.storage.from_(bucket).upload(file_name, f, {"upsert": "true", "content-type": mime_type})

#     """
#     if res:
#         print("Profile picture upload failed: ", res)
#         return None
#     """
#     #note: as of now, there is no error handling. will be added in future
#     if not res.data:
#         print("something went wrong uploading user profile picture")
#         return None

#     #build public url
#     public_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/{bucket}/{file_name}"

#     #updates the db
#     supabase.table("users").update({"profile_image": public_url}).eq("id", uid).execute()

#     return public_url

def upload_profile_picture_by_user_id(uid: str, file_path: str):
    try:
        bucket = "profile-pictures"
        file_name = f"user_{uid}.png"  # Always use .png for consistency
        
        print(f"Starting upload for user {uid}, file: {file_path}")
        
        if not os.path.exists(file_path):
            error_msg = f"File not found: {file_path}"
            print(error_msg)
            return None
        
        if not is_image_file(file_path):
            error_msg = "Invalid file type. Only image files (jpg/png) are allowed."
            print(error_msg)
            return None

        # Read the file content
        with open(file_path, "rb") as f:
            file_content = f.read()
            print(f"Read {len(file_content)} bytes from {file_path}")

        # First, try to remove existing file if it exists
        try:
            print(f"Attempting to remove existing file: {file_name}")
            supabase.storage.from_(bucket).remove([file_name])
            print("Existing file removed successfully")
        except Exception as e:
            print(f"Note: Could not remove existing file (might not exist): {str(e)}")

        # Upload the new file
        try:
            print(f"Uploading new file: {file_name}")
            res = supabase.storage.from_(bucket).upload(
                file_name,
                file_content,
                {"content-type": "image/png", "upsert": "true"}
            )
            print(f"Upload response: {res}")
            
            # Build the public URL
            public_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/{bucket}/{file_name}"
            print(f"Public URL: {public_url}")
            
            # Update the users table with the new URL
            response = supabase.table("users").update(
                {"profile_image": public_url}
            ).eq("id", uid).execute()

            if hasattr(response, 'error') and response.error:
                print(f"Error updating profile image URL: {response.error}")
                return None

            print("Profile picture updated successfully")
            return public_url

        except Exception as upload_error:
            print(f"Error during upload: {str(upload_error)}")
            return None

    except Exception as e:
        print(f"Unexpected error in upload_profile_picture_by_user_id: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def get_user_id_by_username(username: str):
    result = get_user_by_username(username)
    return result["id"] 

def get_user_id_by_email(email: str):
    result = get_user_by_email(email)
    return result["id"]

def get_user_password_hash(uid: str):
    res = supabase.table("users").select("password_hash").eq("id", uid).execute()
    if res.data and len(res.data) > 0:
        return res.data[0]["password_hash"]
    return None

def verify_password(uid: str, password_attempt: str) -> bool:
    stored_hash = get_user_password_hash(uid)
    if not stored_hash:
        print("User not found or no password hash stored.")
        return False

    return bcrypt.checkpw(password_attempt.encode("utf-8"), stored_hash.encode("utf-8"))

def change_password(uid: str, old_password: str, new_password: str) -> bool:
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
    
def verify_email(email: str, verification_code: int):
    res = supabase.table("users").select("id, verification_code").eq("email", email).execute()
    if not res.data:
        print("User not found")
        return False

    user_data = res.data[0]
    stored_code = user_data.get("verification_code")
    if stored_code is None:
        print("No verification code set. Please request a new one.")
        return False

    if str(stored_code) != str(verification_code):
        print("Invalid verification code.")
        return False

    supabase.table("users").update({
        "email_verified": True,
        "verification_code": 100100
    }).eq("email", email).execute()
    print("Email successfully verified!")
    return True

def send_verification_email(email):
    response = supabase.table("users").select("*").eq("email", email).execute()
    if not response.data:
        print("No user found with that email.")
        return
    verification_code = response.data[0].get("verification_code")

    msg = MIMEText(f"Your code to verify your email: {verification_code}")
    msg["Subject"] = "Verify Your Email"
    msg["From"] = os.getenv("SMTP_USER")
    msg["To"] = email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(os.getenv("SMTP_USER"), os.getenv("SMTP_PASS"))
            server.send_message(msg)
        print(f"Verification email sent to {email}")
    except Exception as e:
        print(f"Error sending email: {e}")

def generate_new_verification_code(uid: str):
    random_int = random.randint(100000, 999999)
    verification_code = f"{random_int:06d}"
    res = supabase.table("users").select("*").eq("id", uid).execute()
    if not res.data:
        print("User not found")
        return False
    
    response = supabase.table("users").update({"verification_code": int(verification_code)}).eq("id", uid).execute()
    
    if not response.data:
        print("Failed to update verification code.")
        return None
    
    print(f"Verification code {verification_code} generated for user {uid}.")
    return verification_code

def is_user_verified(email: str) -> bool:
    try:
        response = (
            supabase.table("users")
            .select("email_verified")
            .eq("email", email)
            .execute()
        )

        if not response.data or len(response.data) == 0:
            print(f"User with email '{email}' not found.")
            return False

        return response.data[0].get("email_verified", False)

    except Exception as e:
        print(f"Error checking verification status for {email}: {e}")
        return False

# def update_user_profile(uid: str, updates: dict):
#     try:
#         if not uid:
#             return {"success": False, "message": "User ID is required"}
            
#         if not updates:
#             return {"success": False, "message": "No updates provided"}
            
#         # Handle profile image separately if it's a base64 string
#         profile_image = updates.pop('profile_image', None)
        
#         # Update other user fields if any
#         if updates:
#             response = supabase.table("users").update(updates).eq("id", uid).execute()
#             if hasattr(response, 'error') and response.error:
#                 return {"success": False, "message": f"Database update failed: {response.error.message}"}
        
#         # If there was a profile image to upload
#         if profile_image and isinstance(profile_image, str) and profile_image.startswith('data:image'):
#             import base64
#             import tempfile
            
#             # Extract image data from base64 string
#             format, imgstr = profile_image.split(';base64,')
#             ext = format.split('/')[-1]
            
#             # Create a temporary file to store the image
#             with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{ext}') as f:
#                 f.write(base64.b64decode(imgstr))
#                 temp_path = f.name
            
#             try:
#                 # Upload the profile picture using the existing function
#                 public_url = upload_profile_picture_by_user_id(uid, temp_path)
#                 if not public_url:  # Check if the upload was successful
#                     return {"success": False, "message": "Failed to upload profile image"}
#                 # Update the profile_image in the updates to be returned
#                 updates['profile_image'] = public_url
#             finally:
#                 # Clean up the temporary file
#                 if os.path.exists(temp_path):
#                     os.unlink(temp_path)
        
#         # Fetch the updated user data
#         user_data = get_user_by_id(uid)
#         if not user_data:
#             return {"success": False, "message": "Failed to fetch updated user data"}
            
#         return {
#             "success": True,
#             "data": {
#                 "id": user_data["id"],
#                 "username": user_data.get("username", ""),
#                 "profile_image": user_data.get("profile_image", ""),
#                 "email": user_data.get("email", "")
#             }
#         }
        
#     except Exception as e:
#         print(f"Error updating user profile: {str(e)}")
#         return {"success": False, "message": f"An error occurred while updating profile: {str(e)}"}

def update_user_profile(uid: str, updates: dict):
    try:
        if not uid:
            return {"success": False, "message": "User ID is required"}
            
        if not updates:
            return {"success": False, "message": "No updates provided"}
            
        # Handle profile image separately if it's a base64 string
        profile_image = updates.pop('profile_image', None)
        
        # First, update other user fields if any
        if updates:
            response = supabase.table("users").update(updates).eq("id", uid).execute()
            if hasattr(response, 'error') and response.error:
                return {"success": False, "message": f"Database update failed: {response.error.message}"}
        
        # If there was a profile image to handle
        if profile_image:
            if isinstance(profile_image, str) and profile_image.startswith('http'):
                # If it's already a URL, just update the database
                updates['profile_image'] = profile_image
            elif isinstance(profile_image, str) and profile_image.startswith('data:image'):
                # It's a base64 image, try to upload it
                try:
                    import base64
                    import tempfile
                    import uuid
                    
                    # Extract image data from base64 string
                    format, imgstr = profile_image.split(';base64,')
                    ext = format.split('/')[-1]
                    
                    # Create a temporary file with a unique name
                    temp_file = f"temp_{uuid.uuid4()}.{ext}"
                    with open(temp_file, "wb") as f:
                        f.write(base64.b64decode(imgstr))
                    
                    # Upload the file
                    public_url = upload_profile_picture_by_user_id(uid, temp_file)
                    
                    # Clean up the temporary file
                    if os.path.exists(temp_file):
                        os.unlink(temp_file)
                        
                    if not public_url:
                        return {"success": False, "message": "Failed to upload profile image"}
                        
                    updates['profile_image'] = public_url
                    
                except Exception as e:
                    print(f"Error processing profile image: {str(e)}")
                    return {"success": False, "message": f"Error processing profile image: {str(e)}"}
        
        # Fetch the updated user data
        user_data = get_user_by_id(uid)
        if not user_data:
            return {"success": False, "message": "Failed to fetch updated user data"}
            
        return {
            "success": True,
            "data": {
                "id": user_data["id"],
                "username": user_data.get("username", ""),
                "profile_image": user_data.get("profile_image", ""),
                "email": user_data.get("email", "")
            }
        }
        
    except Exception as e:
        print(f"Error updating user profile: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"success": False, "message": f"An error occurred while updating profile: {str(e)}"}
#NO VERIFICATION FOR THIS FUNCTION
def change_email_by_uid(new_user_email: str, uid: str):
    try:
        existing = (
            supabase.table("users")
            .select("id")
            .eq("email", new_user_email)
            .execute()
        )

        if existing.data:
            return {"success": False, "message": "Email is already in use."}

        response = (supabase.table("users").update({"email": new_user_email}).eq("id", uid).execute())

        if not response.data:
            return {"success": False, "message": "Failed to update email."}

        return True

    except Exception as e:
        return {"success": False, "message": f"Error updating email: {e}"}

def generate_password_reset_code(email: str):
    """Generate a 6-digit password reset code and store it with expiration time"""
    try:
        email = email.strip().lower()
        user = get_user_by_email(email)
        if not user:
            return {"success": False, "message": "User not found with that email."}
        
        # Generate 6-digit reset code
        random_int = random.randint(100000, 999999)
        reset_code = f"{random_int:06d}"
        
        # Set expiration time (1 hour from now)
        expires_at = (datetime.utcnow() + timedelta(hours=1)).isoformat()
        
        # Store reset code and expiration in database
        # Using password_reset_code and password_reset_code_expires fields
        # If these fields don't exist in your schema, you may need to add them
        response = supabase.table("users").update({
            "password_reset_code": int(reset_code),
            "password_reset_code_expires": expires_at
        }).eq("email", email).execute()
        
        if response.data:
            return {"success": True, "reset_code": reset_code}
        else:
            return {"success": False, "message": "Failed to generate reset code"}
    except Exception as e:
        return {"success": False, "message": f"Error generating reset code: {e}"}

def send_password_reset_email(email: str):
    """Send password reset code via email"""
    try:
        email = email.strip().lower()
        user = get_user_by_email(email)
        if not user:
            # Don't reveal if email exists or not for security
            return {"success": True, "message": "If that email exists, a reset code has been sent."}
        
        # Generate reset code
        code_result = generate_password_reset_code(email)
        if not code_result.get("success"):
            return code_result
        
        reset_code = code_result.get("reset_code")
        
        # Send email
        msg = MIMEText(f"Your password reset code is: {reset_code}\n\nThis code will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.")
        msg["Subject"] = "Password Reset Code"
        msg["From"] = os.getenv("SMTP_USER")
        msg["To"] = email
        
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(os.getenv("SMTP_USER"), os.getenv("SMTP_PASS"))
                server.send_message(msg)
            print(f"Password reset email sent to {email}")
            return {"success": True, "message": "Password reset code sent to your email."}
        except Exception as e:
            print(f"Error sending password reset email: {e}")
            return {"success": False, "message": f"Error sending email: {e}"}
    except Exception as e:
        return {"success": False, "message": f"Error in password reset: {e}"}

def verify_password_reset_code(email: str, reset_code: int) -> bool:
    """Verify if the reset code is valid and not expired"""
    try:
        email = email.strip().lower()
        response = supabase.table("users").select("password_reset_code, password_reset_code_expires").eq("email", email).execute()
        
        if not response.data or len(response.data) == 0:
            print("User not found")
            return False
        
        user_data = response.data[0]
        stored_code = user_data.get("password_reset_code")
        expires_at_str = user_data.get("password_reset_code_expires")
        
        if stored_code is None:
            print("No reset code found. Please request a new one.")
            return False
        
        if expires_at_str:
            try:
                # Parse the expiration datetime
                expires_str = expires_at_str.replace('Z', '+00:00') if 'Z' in expires_at_str else expires_at_str
                expires_at = datetime.fromisoformat(expires_str)
                
                # Get current UTC time (timezone-aware)
                from datetime import timezone
                now_utc = datetime.now(timezone.utc)
                
                # Convert expires_at to timezone-aware if it's naive
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                
                if now_utc > expires_at:
                    print("Reset code has expired. Please request a new one.")
                    return False
            except Exception as e:
                print(f"Error parsing expiration date: {e}")
                # If we can't parse, assume expired for security
                return False
        
        if str(stored_code) != str(reset_code):
            print("Invalid reset code.")
            return False
        
        return True
    except Exception as e:
        print(f"Error verifying reset code: {e}")
        return False

def reset_password(email: str, reset_code: int, new_password: str) -> dict:
    """Reset user password after verifying the reset code"""
    try:
        email = email.strip().lower()
        
        # Verify the reset code
        if not verify_password_reset_code(email, reset_code):
            return {"success": False, "message": "Invalid or expired reset code."}
        
        # Hash the new password
        new_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Update password and clear reset code
        response = supabase.table("users").update({
            "password_hash": new_hash,
            "password_reset_code": None,
            "password_reset_code_expires": None
        }).eq("email", email).execute()
        
        if response.data:
            print("Password reset successfully.")
            return {"success": True, "message": "Password has been reset successfully."}
        else:
            return {"success": False, "message": "Failed to reset password."}
    except Exception as e:
        return {"success": False, "message": f"Error resetting password: {e}"}
