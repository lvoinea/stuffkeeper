import datetime
from sqlalchemy.orm import Session
import json
import os

from . import models, schemas, security

class DbException(Exception):
    pass

class DbExceptionNotFound(DbException):
    pass


#------------------------------------------ Utils

def prepare_db_object(db: Session, db_object, poco_object):
    """Copy the values of a data object (a.k.a., plain old class object - poco) to an ORM object.
    List entries are ignored and should be treated separately in the caller."""
    object_data = poco_object.dict(exclude_unset=True)
    for key, value in object_data.items():
        if (key == 'photos'):
            setattr(db_object, key, json.dumps(value))
        elif not isinstance(value, list):
            setattr(db_object, key, value)

def get_or_create(session, model, **kwargs):
    instance = session.query(model).filter_by(**kwargs).first()
    if instance:
        return instance
    else:
        instance = model(**kwargs)
        session.add(instance)
        session.commit()
        return instance

#------------------------------------------ Users

def get_user(db: Session, user_id: int):
    """Get a specific user in the DB.
    The user is identified by its ID in the DB.
    """
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    """Get a specific user in the DB.
    The user is identified by its email.
    """
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    """Create a new user in the DB.
    The user is identified by its email. If the user exists already, an exception is raised."""
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise DbException('User already registered.')
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        settings=user.settings,
        creation_date=datetime.date.today(),
        items=[],
        locations=[],
        tags=[]
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

#------------------------------------------ Items

def get_user_item(db: Session, user_id: int, item_id: int):
    """Get an item associated with a specific user.
    Both the item and the user are identified by their ID in the DB.
    If either the item or the user is not found, or the item is not associated with the user,
    an exception is raised.
    """
    db_item = db.query(models.Item).filter(models.Item.owner_id == user_id).filter(models.Item.id == item_id).first()
    if not db_item:
        raise DbExceptionNotFound('Item not found')
    return db_item

def get_user_items(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Get the items associated with a user.
    An offset and a limit can be given, to facilitate implementing paging by clients.
    If no items are found an empty list is returned.
    """
    return db.query(models.Item).filter(models.Item.owner_id == user_id).offset(skip).limit(limit).all()

def create_user_item(db: Session, item: schemas.ItemCreate, user_id: int):
    """Create an item in the DB associated with a user."""

    # Add normal fields
    item_fields = {}
    for key, value in item.dict(exclude_unset=True).items():
        if (key == 'photos'):
            item_fields[key] = json.dumps(value)
        elif not isinstance(value, list):
            item_fields[key] = value
    db_item = models.Item(
        **item_fields,
        addition_date= datetime.date.today(),
        is_active=True,
        owner_id=user_id
    )

    # Add locations
    if item.locations:
        for location in item.locations:
            db_location = get_or_create(db, models.Location, name=location.name, owner_id=user_id)
            db_item.locations.append(db_location)
    else:
        db_item.locations = []

    # Add tags
    if item.tags:
        for tag in item.tags:
            db_tag = get_or_create(db, models.Tag, name=tag.name, owner_id=user_id)
            db_item.tags.append(db_tag)
    else:
        db_item.tags = []

    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_user_item(db: Session, item_id: int, item: schemas.ItemUpdate, user_id: int):
    """Update an item in the DB associated with a specific user.
    If the item is not found in the DB, an exception is raised."""
    db_item = db.query(models.Item).filter(models.Item.owner_id == user_id).filter(models.Item.id == item_id).first()
    if not db_item:
        raise DbExceptionNotFound('Item not found')

    # Remove deleted images
    if (item.photos):
        previous = json.loads(db_item.photos)
        for source in previous['sources']:
            if source not in item.photos.sources:
                path_id = source.replace('-', '/')
                file_path = f'./local/photos/{user_id}/{path_id}'
                if os.path.isfile(file_path):
                    os.remove(file_path)
                    os.remove(f'{file_path}.full')
                    os.remove(f'{file_path}.thumb')

    # Add normal fields
    prepare_db_object(db, db_item, item)

    # Update locations
    if item.locations:
        db_item.locations=[]
        for location in item.locations:
            db_location = get_or_create(db, models.Location, name=location.name, owner_id=user_id)
            db_item.locations.append(db_location)

    # Update tags
    if item.tags:
        db_item.tags=[]
        for tag in item.tags:
            db_tag = get_or_create(db, models.Tag, name=tag.name, owner_id=user_id)
            db_item.tags.append(db_tag)

    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

#------------------------------------------ Tags

def get_user_tags(db: Session, user_id: int):
    """Get the tags associated with a user.
    If no tags are found an empty list is returned.
    """
    return db.query(models.Tag).filter(models.Tag.owner_id == user_id).all()

def update_user_tag(db: Session, tag_id: int, tag: schemas.TagUpdate, user_id: int):
    """Update a tag in the DB associated with a specific user.
    If the tag is not found in the DB, an exception is raised."""
    db_tag = db.query(models.Tag).filter(models.Tag.owner_id == user_id).filter(models.Tag.id == tag_id).first()
    if not db_tag:
        raise DbExceptionNotFound('Tag not found')

    # Check if a tag exists and has the same name but different id
    if tag.name:
        conflicting_tag = db.query(models.Tag).\
            filter(models.Tag.owner_id == user_id).\
            filter(models.Tag.name == tag.name).first()
        if (conflicting_tag and conflicting_tag.id != tag_id):
            raise DbException('Tag name already exists.')

    prepare_db_object(db, db_tag, tag)

    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

#------------------------------------------ Locations

def get_user_locations(db: Session, user_id: int):
    """Get the locations associated with a user.
    If no locations are found an empty list is returned.
    """
    return db.query(models.Location).filter(models.Location.owner_id == user_id).all()

def update_user_location(db: Session, location_id: int, location: schemas.LocationUpdate, user_id: int):
    """Update a location in the DB associated with a specific user.
    If the location is not found in the DB, an exception is raised."""
    db_location = db.query(models.Location).filter(models.Location.owner_id == user_id).filter(models.Location.id == location_id).first()
    if not db_location:
        raise DbExceptionNotFound('Location not found.')

    # Check if a location exists and has the same name but different id
    if location.name:
        conflicting_location = db.query(models.Location).\
            filter(models.Location.owner_id == user_id).\
            filter(models.Location.name == location.name).first()
        if (conflicting_location and conflicting_location.id != location_id):
            raise DbException('Location name already exists.')

    prepare_db_object(db, db_location, location)

    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location
