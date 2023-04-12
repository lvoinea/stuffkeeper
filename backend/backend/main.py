from typing import List
import uvicorn

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.encoders import jsonable_encoder
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
import json
from sqlalchemy.orm import Session

from backend import crud, models, schemas, security
from backend.database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://192.168.68.133:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#---------------------------------------------------- Login
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = security.decode_token(token)
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except security.SecurityException:
        raise credentials_exception
    user_db = crud.get_user_by_email(db, email=token_data.email)
    if user_db is None:
        raise credentials_exception
    return user_db


async def get_current_active_user(current_user: schemas.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(
        db: Session = Depends(get_db),
        form_data: OAuth2PasswordRequestForm = Depends()):
    user_db = crud.get_user_by_email(db, form_data.username)
    user_db = security.authenticate_user(user_db, form_data.password)
    if not user_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(data={"sub": user_db.email})
    return {"access_token": access_token, "token_type": "bearer"}

#---------------------------------------------------- Users

@app.post("/users/", response_model=schemas.User)
def create_user(
        user: schemas.UserCreate,
        db: Session = Depends(get_db)):
    """Create an user"""
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=422, detail="User already registered.")
    new_user_db = crud.create_user(db=db, user=user)
    return new_user_db


@app.get("/users/me", response_model=schemas.User)
def read_user(current_user_db: schemas.User = Depends(get_current_active_user)):
    """Get the information associated with the current user."""

    if current_user_db is None:
        raise HTTPException(status_code=404, detail="User not found")
    return current_user_db

#---------------------------------------------------- Items

def create_serializable_item(item_db):
    serializable_item = jsonable_encoder(item_db)
    if ('photos' in serializable_item):
        serializable_item['photos'] = json.loads(serializable_item['photos'])
    return serializable_item

@app.post("/user/me/items/", response_model=schemas.Item)
def create_user_item(
        item: schemas.ItemCreate,
        db: Session = Depends(get_db),
        current_user_db: schemas.User = Depends(get_current_active_user)):
    """Create an item for the current user."""

    current_user_id = current_user_db.id

    item_db = crud.create_user_item(db=db, item=item, user_id=current_user_id)
    item_serializable = create_serializable_item(item_db)
    return item_serializable


@app.get("/users/me/items/", response_model=List[schemas.Item])
def get_user_items(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db),
        current_user_db: schemas.User = Depends(get_current_active_user)):
    """Get the items associated with the current user."""

    current_user_id = current_user_db.id

    items_db = crud.get_user_items(db, current_user_id, skip=skip, limit=limit)
    items_serializable = [create_serializable_item(item_db) for item_db in items_db]
    return items_serializable


@app.get("/users/me/items/{item_id}", response_model=schemas.Item, responses={404: {"description": "Item not found"}})
def get_user_item(
        item_id: int,
        db: Session = Depends(get_db),
        current_user_db: schemas.User = Depends(get_current_active_user)):
    """Get detailed information about a specific item associated with the current user."""

    current_user_id = current_user_db.id

    try:
        item_db = crud.get_user_item(db, current_user_id, item_id)
        item_serializable = create_serializable_item(item_db)
    except crud.DbExceptionNotFound:
        raise HTTPException(status_code=404, detail="Item not found")

    return item_serializable

@app.post("/users/me/items/{item_id}", response_model=schemas.Item, responses={404: {"description": "Item not found"}})
def update_user_item(
        item_id: int,
        item: schemas.ItemUpdate,
        db: Session = Depends(get_db),
        current_user_db: schemas.User = Depends(get_current_active_user)):
    """Update the information of a specific item associated with the current user."""

    current_user_id = current_user_db.id

    try:
        item_db = crud.update_user_item(db=db, item_id=item_id, item=item, user_id=current_user_id)
        item_serializable = create_serializable_item(item_db)
    except crud.DbExceptionNotFound:
        raise HTTPException(status_code=404, detail="Item not found")

    return item_serializable

#---------------------------------------------------- Tags

@app.get("/users/me/tags/", response_model=List[schemas.Tag])
def get_user_tags(
        db: Session = Depends(get_db),
        current_user_db: schemas.User = Depends(get_current_active_user)):
    """Get the tags associated with the current user."""

    current_user_id = current_user_db.id

    tags_db = crud.get_user_tags(db, current_user_id)
    return tags_db

@app.post("/users/me/tags/{tag_id}", response_model=schemas.Tag, responses={404: {"description": "Tag not found"}})
def update_user_tag(
        tag_id: int,
        tag: schemas.TagUpdate,
        db: Session = Depends(get_db),
        current_user_db: schemas.User = Depends(get_current_active_user)):
    """Update a specific tag associated with the current user."""

    current_user_id = current_user_db.id

    try:
        tag_db = crud.update_user_tag(db, tag_id=tag_id, tag=tag, user_id=current_user_id)
    except crud.DbExceptionNotFound:
        raise HTTPException(status_code=404, detail="Tag not found")
    except crud.DbException:
        raise HTTPException(status_code=422, detail="Tag name already exists")

    return tag_db

#---------------------------------------------------- Locations

@app.get("/users/me/locations/", response_model=List[schemas.Location])
def get_user_locations(
        db: Session = Depends(get_db),
        current_user_db: schemas.User = Depends(get_current_active_user)):
    """Get the locations associated with the current user."""

    current_user_id = current_user_db.id

    locations_db = crud.get_user_locations(db, current_user_id)
    return locations_db


@app.post("/users/me/locations/{location_id}", response_model=schemas.Location, responses={404: {"description": "Location not found"}})
def update_user_location(
        location_id: int,
        location: schemas.LocationUpdate,
        db: Session = Depends(get_db),
        current_user_db: schemas.User = Depends(get_current_active_user)):
    """Update a specific location associated with the current user."""

    current_user_id = current_user_db.id

    try:
        location_db = crud.update_user_location(db, location_id=location_id, location=location, user_id=current_user_id)
    except crud.DbExceptionNotFound:
        raise HTTPException(status_code=404, detail="Location not found")
    except crud.DbException:
        raise HTTPException(status_code=422, detail="Location name already exists")

    return location_db

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)