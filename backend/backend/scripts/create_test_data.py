import random
from backend import models
from backend.database import SessionLocal, engine
from backend.crud import *
from backend.schemas import *

db = SessionLocal()
#models.Base.metadata.create_all(bind=engine)

#------------------ Config data

tags = ['tool', 'hobby', 'food', 'jeans', 'jacket']

location = ['kitchen', 'bathroom', 'sleeping room', 'box 1', 'box 2']

things = ['Car', 'Bicycle', 'Bike', 'Banknote', 'Wallet', 'Blouse', 'Bag', 'Shirt', 'Helmet', 'Toothbrush',
          'Key', 'Table', 'Coin', 'Trousers', 'Pants', 'Sweater', 'Shoe', 'Cupboard', 'Pillow', 'Coffee maker', 'Bed',
          'Spoon', 'Blanket', 'Knife', 'Stove', 'Sink', 'Washing machine', 'Pot', 'Dish', 'Fridge', 'Sofa', 'Stool',
          'Cup', 'Fork', 'Glass', 'Pen' , 'Computer', 'Notebook', 'Desk', 'Pencil', 'Bookcase', 'Book', 'Chair',
          'Backpack', 'Paper', 'Glue', 'Door', 'Ruler', 'Clock', 'Whiteboard', 'Window']

thumbnail = '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'


#------------------ Create test user

user = create_user(db,
    UserCreate(email='test', password='test', settings='{}')
)

#------------------ Create things

"""
ItemPhotos
    thumbnail: Union[str, None] = None
    selected: Union[str, None] = None
    sources: List[str] = []

ItemCreate
    code: Union[str, None] = None
    expiration_date: Union[datetime.date, None] = None
    
    is_active: Union[bool, None] = None
    is_bookmarked: Union[bool, None] = None
    is_silenced: Union[bool, None] = None
"""

for thing in things:
    nr_tags = random.randint(0, 3)
    nr_locations = random.randint(0, 2)
    nr_photos = random.randint(0, 4)

    item_tags = [TagBase(name=tag) for tag in random.sample(tags, nr_tags) ]
    item_locations = [LocationBase(name=location) for location in random.sample(location, nr_locations)]
    item_photos = ItemPhotos(sources=[])
    if (nr_photos > 1):
        item_photos.thumbnail = thumbnail
        item_photos.selected = 0
        item_photos.sources.append('photo1.jpeg')
    if (nr_photos > 2):
        item_photos.sources.append('photo2.jpeg')
    if (nr_photos > 3):
        item_photos.sources.append('photo3.jpeg')

    create_user_item(db,
        ItemCreate(
            name = thing,
            description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor \
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation \
            ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit \
            in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
            photos = item_photos,
            tags = item_tags,
            locations = item_locations,
            quantity = random.randint(1, 2),
            cost=random.randint(0,10)
        ),
    user.id)

print('Test set inserted into the DB.')