from datetime import datetime
from typing import Any, Dict, List

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from db_supabase.db_util import (
    add_user,
    login_user,
    send_verification_email as send_verification_email_service,
    verify_email as verify_email_service,
    is_user_verified as user_verified,
    get_user_by_id as get_user,
    get_user_by_email
)



from db_supabase.db_level_user_progress_util import add_learning_user, get_user_learning_progress

from db_supabase.db_lessons import get_lesson_by_id
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use "*" for local testing only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.post ("/api/send_verification_email")
async def send_verification_email_root(request: Request):
    data = await request.json()
    email = data.get("email")
    if not email:
        return {"status": "error", "message": "Missing email"}

    try:
        result = send_verification_email_service(email)
        return {"status": "success", "data": result}
    except Exception as e:
        print(" Error sending verification email:", e)
        return {"status": "error", "message": str(e)}
    
@app.post("/api/verify_email")
async def verify_email_root(request: Request):
    data = await request.json()
    result = verify_email_service(data["email"], data["verification_code"])
    return {"status": "success", "data": result}

@app.post("/api/is_user_verified")
async def is_user_verified_root(request: Request):
    data = await request.json();
    result = user_verified( data["email"])
    return {"status": "success", "data": result}


@app.post("/api/add_user")
async def add_user_root(request: Request):
    data = await request.json();
    result = add_user(data["name"], data["email"], data["password_hash"])
    return {"status": "success", "data": result}


@app.post("/api/login_user")
async def login_user_root(request: Request):
    data = await request.json()
    result = login_user( data["email"], data["password_hash"])
    
    return {"status": "success", "data": result}
  
    
@app.post("/api/add_learning_user")
async def add_learning_root(request:Request):
    data = await request.json()
    uid = data.get("uid")
    return add_learning_user(uid);
 
@app.post("/api/get_user_by_email")
async def get_user_by_email_root(request: Request):
    data = await request.json()
    email = data.get("email")
    user = get_user_by_email(email)
    if user:
        return {"status": "success", "data": user}
    else:
        return {"status": "error", "message": "User not found"}

 

@app.post("/api/get_user_learning_progress")
async def get_user__learning_progress_root(request: Request):
    data = await request.json()
    uid = data.get("uid")
    print(f"Received uid: {uid}")
    return {"status": "success", "received_uid": uid}
    
    
@app.post("/api/get_lesson_by_id")
async def get_lesson_by_id_root(request: Request):
    data = await request.json()
    lesson_id = data.get("lesson_id")

    if not lesson_id:
        return {"status": "error", "message": "Missing lesson_id"}

    lesson = get_lesson_by_id(lesson_id)
    if lesson:
        return {"status": "success", "data": lesson}
    else:
        return {"status": "error", "message": "Lesson not found"}

 

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
