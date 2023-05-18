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

class ItemPhotos(BaseModel):
    thumbnail: Union[str, None] = None
    selected: Union[int, None] = None
    sources: Union[List[str], None] = None

class ItemBase(BaseModel):
    name: Union[str, None] = None
    description: Union[str, None] = None

    quantity: Union[int, None] = None
    cost: Union[int, None] = None
    expiration_date: Union[datetime.date, None] = None
    code: Union[str, None] = None

    photos: Union[ItemPhotos, None] = None

    locations: Union[List[LocationBase], None] = None
    tags: Union[List[TagBase], None] = None

class ItemCreate(ItemBase):
    pass

class ItemUpdate(ItemBase):
    is_active: Union[bool, None] = None
    is_bookmarked: Union[bool, None] = None
    is_silenced: Union[bool, None] = None


class Item(ItemUpdate):
    id: int
    addition_date: datetime.date
    removal_date: Union[datetime.date, None] = None

    class Config:
        orm_mode = True

#---------------------------------- Item
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Union[str, None] = None