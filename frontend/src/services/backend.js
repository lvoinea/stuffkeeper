
// Production deployment
//const backendAddress = 'http://192.168.68.133:8080/api';

//Local deployment
const backendAddress = 'http://192.168.68.133:8000/api';

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

var items = null;

const updateCachedItem = (id) => (savedItem) => {
    if (items) {
        const existingIndex = items.findIndex(record => record.id === parseInt(id));
        if (existingIndex > -1) {
            items[existingIndex] = savedItem;
        } else {
            items.unshift(savedItem);
        }
    }
    return savedItem;
}

const removeCachedItem = (id) => {
    if (items) {
        const existingIndex = items.findIndex(record => record.id === parseInt(id));
        if (existingIndex > -1) {
            items.splice(existingIndex,1);
        }
    }
}



export function getItems({token}) {
  if (token) {
    return items? items: fetch(`${backendAddress}/users/me/items/`, {
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
                items = serverItems;
                return items;
            });
        }
        return response.text().then(text => {throw new ApplicationException({code: response.status, message:text})})
      })
  }
  else {
    return [];
  }
}

export function loadItem({token, id}) {
    if (items) {
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

export function saveItem({token, item, id}) {
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

export function addItem({token, item}) {
  return fetch(`${backendAddress}/users/me/items`, {
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
            updateCachedItem(newItem.id)(newItem);
            return newItem;
        });
    }
    return response.text().then(text => {throw new ApplicationException({code: response.status, message:text})})
  })
}

export function archiveItem({token, id, active}) {
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

export function deleteItem({token, id}) {
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

export function loadItemImage({token, id, image}) {
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

export async function saveItemImage({token, id, imageUrl, mode}) {
    const imageBlob = await fetch(imageUrl).then(r => r.blob()).then(blobFile => new File([blobFile], "image", { type: "image/jpeg" }));
    const formData = new FormData();
    formData.append('file', imageBlob);

    return fetch(`${backendAddress}/users/me/items/${id}/image/?mode=${mode}`, {
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

//------------------------------------------- Token

export function getTags({token}) {
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
            return response.json()
        }
        return response.text().then(text => {throw new ApplicationException({code: response.status, message:text})})
      })
  }
  else {
    return [];
  }
}

export function checkTag(name, existingTags ) {
    const found = existingTags.find(tag => tag.name === name );
    return found
}

//------------------------------------------- Locations

export function getLocations({token}) {
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
            return response.json()
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