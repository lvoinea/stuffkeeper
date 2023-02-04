from datetime import datetime, timedelta
from decouple import config
from jose import JWTError, jwt
from passlib.context import CryptContext

SECRET_KEY = config('SECRET_KEY')
ALGORITHM = config('ALGORITHM', default='HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = config('ACCESS_TOKEN_EXPIRE_MINUTES', default=60, cast=int)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class SecurityException(Exception):
    pass

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def decode_token(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise  SecurityException('Invalid token')

def authenticate_user(user_db, password: str):
    if not user_db:
        return False
    if not verify_password(password, user_db.hashed_password):
        return False
    return user_db

def create_access_token(data: dict, expires_delta = ACCESS_TOKEN_EXPIRE_MINUTES):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt