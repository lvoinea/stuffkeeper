import uvicorn

from typing import List

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from backend import crud, models, schemas
from backend.database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#---------------------------------------------------- Users

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create an user"""
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=422, detail="User already registered.")
    new_user_db = crud.create_user(db=db, user=user)
    return new_user_db


@app.get("/users/me", response_model=schemas.User)
def read_user(db: Session = Depends(get_db)):
    """Get the information associated with the current user."""

    current_user_db = crud.get_user(db, user_id=1)

    if current_user_db is None:
        raise HTTPException(status_code=404, detail="User not found")
    return current_user_db

#---------------------------------------------------- Items

@app.post("/user/me/items/", response_model=schemas.Item)
def create_user_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    """Create an item for the current user."""
    current_user_id = crud.get_user(db, user_id=1).id

    item_db = crud.create_user_item(db=db, item=item, user_id=current_user_id)
    return item_db


@app.get("/users/me/items/", response_model=List[schemas.ItemBrief])
def get_user_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get the items associated with the current user."""

    current_user_id = crud.get_user(db, user_id=1).id

    items_db = crud.get_user_items(db, current_user_id, skip=skip, limit=limit)
    return items_db


@app.get("/users/me/items/{item_id}", response_model=schemas.Item, responses={404: {"description": "Item not found"}})
def get_user_item(item_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific item associated with the current user."""

    current_user_id = crud.get_user(db, user_id=1).id
    try:
        item_db = crud.get_user_item(db, current_user_id, item_id)
    except crud.DbExceptionNotFound:
        raise HTTPException(status_code=404, detail="Item not found")

    return item_db

@app.post("/users/me/items/{item_id}", response_model=schemas.Item, responses={404: {"description": "Item not found"}})
def update_user_item(item_id: int, item: schemas.ItemUpdate, db: Session = Depends(get_db)):
    """Update the information of a specific item associated with the current user."""

    current_user_id = crud.get_user(db, user_id=1).id

    try:
        item_db = crud.update_user_item(db=db, item_id=item_id, item=item, user_id=current_user_id)
    except crud.DbExceptionNotFound:
        raise HTTPException(status_code=404, detail="Item not found")

    return item_db

#---------------------------------------------------- Tags

@app.get("/users/me/tags/", response_model=List[schemas.Tag])
def get_user_tags(db: Session = Depends(get_db)):
    """Get the tags associated with the current user."""

    current_user_id = crud.get_user(db, user_id=1).id

    tags_db = crud.get_user_tags(db, current_user_id)
    return tags_db

@app.post("/users/me/tags/{tag_id}", response_model=schemas.Tag, responses={404: {"description": "Tag not found"}})
def update_user_tag(tag_id: int, tag: schemas.TagUpdate, db: Session = Depends(get_db)):
    """Update a specific tag associated with the current user."""

    current_user_id = crud.get_user(db, user_id=1).id

    try:
        tag_db = crud.update_user_tag(db, tag_id=tag_id, tag=tag, user_id=current_user_id)
    except crud.DbExceptionNotFound:
        raise HTTPException(status_code=404, detail="Tag not found")
    except crud.DbException:
        raise HTTPException(status_code=422, detail="Tag name already exists")

    return tag_db

#---------------------------------------------------- Locations

@app.get("/users/me/locations/", response_model=List[schemas.Location])
def get_user_locations(db: Session = Depends(get_db)):
    """Get the locations associated with the current user."""

    current_user_id = crud.get_user(db, user_id=1).id

    locations_db = crud.get_user_locations(db, current_user_id)
    return locations_db


@app.post("/users/me/locations/{location_id}", response_model=schemas.Location, responses={404: {"description": "Location not found"}})
def update_user_location(location_id: int, location: schemas.LocationUpdate, db: Session = Depends(get_db)):
    """Update a specific location associated with the current user."""

    current_user_id = crud.get_user(db, user_id=1).id

    try:
        location_db = crud.update_user_location(db, location_id=location_id, location=location, user_id=current_user_id)
    except crud.DbExceptionNotFound:
        raise HTTPException(status_code=404, detail="Location not found")
    except crud.DbException:
        raise HTTPException(status_code=422, detail="Location name already exists")

    return location_db

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)