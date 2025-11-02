from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from db_supabase.db_util import add_user, login_user

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
     allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173"  
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
