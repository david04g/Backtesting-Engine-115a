from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from db_supabase.db_util import ( add_user, login_user,  verify_email as verify_email_service,
    send_verification_email as send_verification_email_service, is_user_verified as user_verified, get_user_id_by_email)

app = FastAPI()


from db_supabase.db_level_user_progress_util import add_learning_user, get_user_learning_progress

from db_supabase.db_lessons import get_lesson_by_id


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use "*" for local testing only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/get_user_id_by_email")
async def get_user_id_by_email_root(request: Request):
    data = await request.json()
    email = data.get("email")

    if not email:
        return {"status": "error", "message": "Missing email"}

    try:
        result = get_user_id_by_email(email)
        return {"status": "success", "data": result}
    except Exception as e:
        print("Error getting user id by email:", e)
        return {"status": "error", "message": str(e)}
    
    
@app.post("/api/add_learning_user")
async def add_learning_user_root(request: Request):
    data = await request.json()
    uid = data.get("uid")

    if not uid:
        return {"status": "error", "message": "Missing uid"}

    try:
        result = add_learning_user(uid)
        return {"status": "success", "result": result}
    except Exception as e:
        print("Error adding learning progress:", e)
        return {"status": "error", "message": str(e)}


@app.post("/api/get_user_learning_progress")
async def get_user_learning_progress_root(request: Request):
    data = await request.json()
    uid = data.get("uid")

    if not uid:
        return {"status": "error", "message": "Missing uid"}

    try:
        result = get_user_learning_progress(uid)
        return {"status": "success", "result": result}
    except Exception as e:
        print("Error getting user learning progress:", e)
        return {"status": "error", "message": str(e)} 

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
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
