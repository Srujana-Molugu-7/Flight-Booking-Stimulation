from sqlmodel import Session
from models import Flight
from database import engine

with Session(engine) as session:
    flights = [
        Flight(source="Mumbai", destination="Delhi", date="2025-12-05", price=3000),
        Flight(source="Bangalore", destination="Chennai", date="2025-12-06", price=2500),
        Flight(source="Hyderabad", destination="Kolkata", date="2025-12-07", price=3500),
    ]
    for f in flights:
        session.add(f)
    session.commit()
    print("Sample flights added.")
