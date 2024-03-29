# TODO

## Yes

- Propagate error when failing to upload image.
- Clean cache upon login/logout

- Document deployment procedure in gdrive
- Update the readme

- Add bookmarking and view


- Add multi edit (delete/archive)
- Add sort options

- Add notifications for expiration + clear notification

- Unit tests

## Maybe

- Add delete for tags and locations. 
This should remove the tag/location from all associated
items before removing the object from the DB.

## Done

- Add loading indicator for images.
- Add logo to the login screen
- Increase life of token to 5h
- Split the description on lines
- Create Docker image and test locally
- Add stats page
- Mark archived items
- Add archive view
- Add searching
- Add new item
- Add image editing
  - Add the carousel as well
  - Extend the carousel with an empty plate
  - Add buttons to plates: delete, add, pin
  - On add, use the cropper to crop the image but do not save to server?
  - On saving the item, save first images to get image names and then the item.
  - On saving the item, delete photos that are no longer valid.
  - On photo upload create different resolutions.
  - On clicking the image load the full size in modal.
  - Add loading indicator.
- Add caching of items
- Add network simulation
- Added photo zoom
- Load item from cache instead of server
- Unify brief and detailed models
- Add edit for tags and locations
- Move logout to drawer
- Add delete item to view panel
- Token based authentication
- Add extra item fields