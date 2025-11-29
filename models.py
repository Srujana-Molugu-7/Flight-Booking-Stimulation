from sqlmodel import SQLModel, Field
from typing import Optional

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    password: str

class Flight(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    source: str
    destination: str
    date: str
    price: float

class Booking(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    flight_id: int
