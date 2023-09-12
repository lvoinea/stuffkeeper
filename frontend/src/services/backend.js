import {store, setItems, setTags, setLocations} from './store';
import {sleep} from './utils';

// Production deployment
//const backendAddress = 'https://stuffkeeper.w3app.nl/api';

//Local Docker
//const backendAddress = 'http://192.168.68.133:8080/api';

//Local deployment
const backendAddress = 'http://127.0.0.1:8000/api';

//------------------------------------------- Exceptions
function ApplicationException({code, message}) {
  this.message = message;
  this.code = code;
}

//------------------------------------------- Login

export function loginUser({username, password, grant_type, scope, client_id, client_secret}) {
 return fetch(`${backendAddress}/token`, {
   method: 'POST',
   mode: 'cors',
   headers: {
     'Content-Type': 'application/x-www-form-urlencoded'
   },
   body: new URLSearchParams({
        username,
        password,
        grant_type: '',
        scope: '',
        client_id: '',
        client_secret: '' })
 })
 .then(response => response.json())
}

//------------------------------------------- Items

const updateCachedItem = (id) => (savedItem) => {

    const state = store.getState();
    let items = state.global.items.slice();

    if (items.length > 0) {
        const existingIndex = items.findIndex(record => record.id === parseInt(id));
        if (existingIndex > -1) {
            items[existingIndex] = savedItem;
        } else {
            items.unshift(savedItem);
        }
        store.dispatch(setItems(items));
    }
    return savedItem;
}

const removeCachedItem = (id) => {

    const state = store.getState();
    let items = state.global.items.slice();

    if (items.length > 0) {
        const existingIndex = items.findIndex(record => record.id === parseInt(id));
        if (existingIndex > -1) {
            items.splice(existingIndex,1);
        }
        store.dispatch(setItems(items));
    }
}

export async function getItems() {

   const state = store.getState();
   const token = state.global.token;
   const items = state.global.items;

  if (token) {
    //await sleep(5000);

    return (items.length > 0) ? items: fetch(`${backendAddress}/users/me/items/`, {
        method: 'GET',
        mode: 'cors',
        headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if(response.ok) {
            return response.json()
            .then( serverItems => {
                store.dispatch(setItems(serverItems));
                return serverItems;
            });
        }
        return response.text().then(text => {throw new ApplicationException({code: response.status, message:text})})
      })
  }
  else {
    store.dispatch(setItems([]));
    return [];
  }
}

export function loadItem({id}) {

    const state = store.getState();
    const token = state.global.token;
    const items = state.global.items;

    if (items.length > 0) {
        const existingIndex = items.findIndex(record => record.id === parseInt(id));
        if (existingIndex > -1) {
            return items[existingIndex];
        }
    }
    // Fallback on server functionality
    return fetch(`${backendAddress}/users/me/items/${id}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if(response.ok) {
            return response.json()
        }
        return response.text().then(text => {throw new ApplicationException({code: response.status, message:text})})
     })
}

export function saveItem({item, id}) {

  const state = store.getState();
  const token = state.global.token;

  return fetch(`${backendAddress}/users/me/items/${id}`, {
    method: 'POST',
    mode: 'cors',
    headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(item)
  })
  .then(response => {
    if(response.ok) {
        return response.json()
        .then(updateCachedItem(id));
    }
    return response.text().then(text => {throw new ApplicationException({code: response.status, message:text})})
  })
}

export function addItem({item}) {

  const state = store.getState();
  const token = state.global.token;

  return fetch(`${backendAddress}/users/me/items/`, {
    method: 'POST',
    mode: 'cors',
    headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(item)
  })
  .then(response => {
    if(response.ok) {
        return response.json()
        .then(newItem => {
            return updateCachedItem(newItem.id)(newItem);
        });
    }
    return response.text().then(text => {throw new ApplicationException({code: response.status, message:text})})
  })
}

export function archiveItem({id, active}) {

  const state = store.getState();
  const token = state.global.token;

  return fetch(`${backendAddress}/users/me/items/${id}`, {
    method: 'POST',
    mode: 'cors',
    headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({"is_active": active})
  })
  .then(response => {
    if(response.ok) {
        return response.json()
        .then(updateCachedItem(id));
    }
    return response.text().then(text => {throw new ApplicationException({code: response.status, message:text})})
  })
}

export function deleteItem({id}) {

  const state = store.getState();
  const token = state.global.token;

  return fetch(`${backendAddress}/users/me/items/${id}`, {
    method: 'DELETE',
    mode: 'cors',
    headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if(response.ok) {
        return removeCachedItem(id);
    }
    else {
        return response.text().then(text => {throw new ApplicationException({code: response.status, message:text})})
    }
  })
}

//------------------------------------------- Images

export function loadItemImage({id, image}) {

  const state = store.getState();
  const token = state.global.token;

  return fetch(`${backendAddress}/users/me/items/${id}/image/${image}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
         'Content-Type': 'image/jpeg',
         'Authorization': `Bearer ${token}`
        }
  })
  .then(response => {
        if(response.ok) {
            return response.blob()
        }
        return response.text().then(text => {throw new ApplicationException({code: response.status, message:text})})
  })
  .then(blob => {
      return URL.createObjectURL(blob);
  });
}

export async function saveItemImage({id, imageUrl, mode}) {

  const state = store.getState();
  const token = state.global.token;

  const imageBlob = await fetch(imageUrl).then(r => r.blob()).then(blobFile => new File([blobFile], "image", { type: "image/jpeg" }));
  const formData = new FormData();
  formData.append('file', imageBlob);

  return fetch(`${backendAddress}/users/me/items/${id}/image?mode=${mode}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
         'Authorization': `Bearer ${token}`
        },
        body: formData
  })
  .then(response => {
        if(response.ok) {
            return response.json()
        }
        return response.text().then(text => {throw new ApplicationException({code: response.status, message:text})})
  });
}

//------------------------------------------- Tags

export function getTags() {

  const state = store.getState();
  const token = state.global.token;

  if (token) {
    return fetch(`${backendAddress}/users/me/tags/`, {
        method: 'GET',
        mode: 'cors',
        headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if(response.ok) {
            return response.json().then(responseTags => {
                store.dispatch(setTags(responseTags));
                return responseTags;
            });
        }
        return response.text().then(text => {throw new ApplicationException({code: response.status, message:text})})
    });
  }
  else {
    return [];
  }
}

export function checkTag(name, existingTags ) {
    const found = existingTags.find(tag => tag.name === name );
    return found
}

export async function renameTag(srcTagName, dstTagName) {

    const state = store.getState();
    const token = state.global.token;
    const items = state.global.items;

    if (token) {

        // Reload tags to make sure the tag ID is present (e.g., after adding a tag via an item)
        const tags = await getTags();
        const srcTag = tags.filter(tag => tag.name === srcTagName)[0];

        // Call api to rename tag
        return fetch(`${backendAddress}/users/me/tags/${srcTag.id}`, {
            method: 'POST',
            mode: 'cors',
            headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({name: dstTagName})
        })
        .then(response => {
            if(response.ok) {

                // Update locally cached tags
                store.dispatch(setTags(tags.map(tag => (tag.name === srcTagName) ? { ...tag, name: dstTagName} : tag)));

                // Update the cached items by changing their tags.
                // NOTE: One could choose to simply reload the items but that is expensive.
                let l_items = items.map(item => {
                    let l_tags = item.tags.map(tag => {
                        return (tag.name === srcTagName) ? { name: dstTagName} : tag;
                    });
                    return {...item, tags: l_tags};
                });
                store.dispatch(setItems(l_items));

                // The updated tag
                return response.json();
            }
            return response.text().then(text => {throw new ApplicationException({code: response.status, message:text})})
        });
    };
}

//------------------------------------------- Locations

export function getLocations() {

  const state = store.getState();
  const token = state.global.token;

  if (token) {
    return fetch(`${backendAddress}/users/me/locations/`, {
        method: 'GET',
        mode: 'cors',
        headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if(response.ok) {
            return response.json().then(responseLocations => {
                store.dispatch(setLocations(responseLocations));
                return responseLocations;
            });
        }
        return response.text().then(text => {throw new ApplicationException({code: response.status, message:text})})
      })
  }
  else {
    return [];
  }
}

export function checkLocation(name, existingLocations ) {
    const found = existingLocations.find(location => location.name === name );
    return found
}

export async function renameLocation(srcLocationName, dstLocationName) {

    const state = store.getState();
    const token = state.global.token;
    const items = state.global.items;

    if (token) {

        // Reload locations to make sure the location ID is present (e.g., after adding a location via an item)
        const locations = await getLocations();
        const srcLocation = locations.filter(location => location.name === srcLocationName)[0];

        // Call api to rename location
        return fetch(`${backendAddress}/users/me/locations/${srcLocation.id}`, {
            method: 'POST',
            mode: 'cors',
            headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({name: dstLocationName})
        })
        .then(response => {
            if(response.ok) {

                // Update locally cached locations
                store.dispatch(setLocations(locations.map(location => (location.name === srcLocationName) ? { ...location, name: dstLocationName} : location)));

                // Update the cached items by changing their locations.
                // NOTE: One could choose to simply reload the items but that is expensive.
                let l_items = items.map(item => {
                    let l_locations = item.locations.map(location => {
                        return (location.name === srcLocationName) ? { name: dstLocationName} : location;
                    });
                    return {...item, locations: l_locations};
                });
                store.dispatch(setItems(l_items));

                // The updated location
                return response.json();
            }
            return response.text().then(text => {throw new ApplicationException({code: response.status, message:text})})
        });
    };
}