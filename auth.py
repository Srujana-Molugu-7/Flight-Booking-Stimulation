from jose import jwt
from datetime import datetime, timedelta

SECRET = "MYSECRETKEY"
ALGO = "HS256"

def create_token(data: dict):
    data["exp"] = datetime.utcnow() + timedelta(days=1)
    return jwt.encode(data, SECRET, algorithm=ALGO)

def verify_token(token: str):
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGO])
    except:
        return None
