from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date, Table
from sqlalchemy.orm import relationship

from .database import Base

item_locations = Table('item_locations', Base.metadata,
    Column('item_id', ForeignKey('items.id'), primary_key=True),
    Column('location_id', ForeignKey('locations.id'), primary_key=True)
)

item_tags = Table('item_tags', Base.metadata,
    Column('item_id', ForeignKey('items.id'), primary_key=True),
    Column('tag_id', ForeignKey('tags.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    settings = Column(String, nullable=False, default="{}")
    is_active = Column(Boolean, nullable=False, default=True)
    creation_date = Column(Date, nullable=False)

    items = relationship("Item", back_populates="owner")
    locations = relationship("Location", back_populates="owner")
    tags = relationship("Tag", back_populates="owner")

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    description = Column(String, nullable=True)

    quantity = Column(Integer, nullable=False, default=1)
    cost = Column(Integer,nullable=False, default=0)
    expiration_date = Column(Date, nullable=True)
    code = Column(String, nullable=True)
    photos = Column(String, nullable=True)

    is_active = Column(Boolean, nullable=False, default=True)
    is_bookmarked = Column(Boolean, nullable=False, default=False)
    is_silenced = Column(Boolean, nullable=False, default=False)

    addition_date = Column(Date, nullable=False)
    removal_date = Column(Date, nullable=True)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="items")
    locations = relationship("Location", secondary="item_locations", back_populates='items', lazy='joined')
    tags = relationship("Tag", secondary="item_tags", back_populates='items', lazy='joined')

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="locations")
    items = relationship("Item", secondary="item_locations", back_populates='locations')

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tags")
    items = relationship("Item", secondary="item_tags", back_populates='tags')