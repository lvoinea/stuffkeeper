from typing import List, Union
import datetime

from pydantic import BaseModel


#---------------------------------- Location

class LocationBase(BaseModel):
    name: str

    class Config:
        orm_mode = True

class LocationCreate(LocationBase):
    pass

class LocationUpdate(LocationBase):
    pass

class Location(LocationBase):
    id: int

#---------------------------------- Tag

class TagBase(BaseModel):
    name: str

    class Config:
        orm_mode = True

class TagCreate(TagBase):
    pass

class TagUpdate(TagBase):
    pass

class Tag(TagBase):
    id: int


#---------------------------------- User

class UserBase(BaseModel):
    email: str
    settings: str

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: str
    is_active: bool

class User(UserBase):
    id: int
    is_active: bool
    creation_date: datetime.date

    locations: List[Location] = []
    tags: List[Tag] = []

    class Config:
        orm_mode = True

#---------------------------------- Item

class ItemBase(BaseModel):
    name: str
    description: Union[str, None] = None
    code: Union[str, None] = None

    quantity: Union[int, None] = None
    photo_large: Union[str, None] = None
    photo_small: Union[str, None] = None

    expiration_date: Union[datetime.date, None] = None

    locations: Union[List[LocationBase], None] = None
    tags: Union[List[TagBase], None] = None

class ItemCreate(ItemBase):
    name: str

class ItemUpdate(ItemBase):
    name: Union[str, None] = None
    removal_date: Union[datetime.date, None] = None

class Item(ItemBase):
    id: int
    name: str
    addition_date: datetime.date
    is_active: bool
    removal_date: Union[datetime.date, None] = None

    class Config:
        orm_mode = True

class ItemBrief(BaseModel):
    id: int
    name: str
    description: Union[str, None] = None
    photo_small: Union[str, None] = None
    quantity: int
    expiration_date: Union[datetime.date, None] = None
    is_active: bool
    locations: List[LocationBase]

    class Config:
        orm_mode = True