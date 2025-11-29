from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select
import os

from database import engine, create_db
from models import User, Flight, Booking
from auth import create_token, verify_token

# ===============================
# FastAPI app
# ===============================
app = FastAPI()

# ===============================
# CORS (for frontend requests)
# ===============================
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# Serve frontend files
# ===============================
# Use absolute path for reliability
public_dir = os.path.join(os.path.dirname(__file__), "public")
if not os.path.exists(public_dir):
    raise RuntimeError(f"Directory '{public_dir}' does not exist!")

app.mount("/", StaticFiles(directory=public_dir, html=True), name="static")

# ===============================
# Database
# ===============================
create_db()

# ===============================
# API Endpoints
# ===============================
@app.post("/signup")
def signup(user: User):
    with Session(engine) as session:
        session.add(user)
        session.commit()
        session.refresh(user)
        return {"message": "User created"}

@app.post("/login")
def login(data: User):
    with Session(engine) as session:
        query = select(User).where(User.username == data.username)
        user = session.exec(query).first()
        if not user or user.password != data.password:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = create_token({"user_id": user.id})
        return {"token": token}

@app.get("/flights")
def flights():
    with Session(engine) as session:
        return session.exec(select(Flight)).all()

@app.post("/book")
def book(booking: Booking):
    with Session(engine) as session:
        session.add(booking)
        session.commit()
        session.refresh(booking)
        return {"message": "Flight booked"}

@app.get("/mybookings/{user_id}")
def mybookings(user_id: int):
    with Session(engine) as session:
        return session.exec(select(Booking).where(Booking.user_id == user_id)).all()
