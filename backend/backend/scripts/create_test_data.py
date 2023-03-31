import random
from backend import models
from backend.database import SessionLocal, engine
from backend.crud import *
from backend.schemas import *

db = SessionLocal()
models.Base.metadata.create_all(bind=engine)

#------------------ Config data

tags = ['tool', 'hobby', 'food', 'jeans', 'jacket']

location = ['kitchen', 'bathroom', 'sleeping room', 'box 1', 'box 2']

things = ['Car', 'Bicycle', 'Bike', 'Banknote', 'Wallet', 'Blouse', 'Bag', 'Shirt', 'Helmet', 'Toothbrush',
          'Key', 'Table', 'Coin', 'Trousers', 'Pants', 'Sweater', 'Shoe', 'Cupboard', 'Pillow', 'Coffee maker', 'Bed',
          'Spoon', 'Blanket', 'Knife', 'Stove', 'Sink', 'Washing machine', 'Pot', 'Dish', 'Fridge', 'Sofa', 'Stool',
          'Cup', 'Fork', 'Glass', 'Pen' , 'Computer', 'Notebook', 'Desk', 'Pencil', 'Bookcase', 'Book', 'Chair',
          'Backpack', 'Paper', 'Glue', 'Door', 'Ruler', 'Clock', 'Whiteboard', 'Window']

#------------------ Create test user

user = create_user(db,
    UserCreate(email='test', password='test', settings='{}')
)

#------------------ Create things

"""
    code: Union[str, None] = None
    quantity: Union[int, None] = None
    photo_large: Union[str, None] = None
    photo_small: Union[str, None] = None
    expiration_date: Union[datetime.date, None] = None
"""

for thing in things:
    nr_tags = random.randint(0, 3)
    nr_locations = random.randint(0, 2)

    item_tags = [TagBase(name=tag) for tag in random.sample(tags, nr_tags) ]
    item_locations = [LocationBase(name=location) for location in random.sample(location, nr_locations)]
    create_user_item(db,
        ItemCreate(
            name = thing,
            description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor \
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation \
            ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit \
            in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
            tags = item_tags,
            locations = item_locations,
        ),
    user.id)

print('Test set inserted into the DB.')