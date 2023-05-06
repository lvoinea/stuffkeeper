
const backendAddress = '192.168.68.133:8000';

//------------------------------------------- Exceptions
function ApplicationException({code, message}) {
  this.message = message;
  this.code = code;
}

//------------------------------------------- Login

export function loginUser({username, password, grant_type, scope, client_id, client_secret}) {
 return fetch(`http://${backendAddress}/token`, {
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
            items.push(savedItem);
        }
    }
    return savedItem;
}

export function getItems({token}) {
  if (token) {
    return items? items: fetch(`http://${backendAddress}/users/me/items/`, {
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
    return fetch(`http://${backendAddress}/users/me/items/${id}`, {
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
  return fetch(`http://${backendAddress}/users/me/items/${id}`, {
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

export function archiveItem({token, id}) {
  return fetch(`http://${backendAddress}/users/me/items/${id}`, {
    method: 'POST',
    mode: 'cors',
    headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({"is_active": false})
  })
  .then(response => {
    if(response.ok) {
        return response.json()
        .then(updateCachedItem(id));
    }
    return response.text().then(text => {throw new ApplicationException({code: response.status, message:text})})
  })
}

//------------------------------------------- Images

export function loadItemImage({token, id, image}) {
    return fetch(`http://${backendAddress}/users/me/items/${id}/image/${image}`, {
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

//------------------------------------------- Token

export function getTags({token}) {
  if (token) {
    return fetch(`http://${backendAddress}/users/me/tags/`, {
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
    return fetch(`http://${backendAddress}/users/me/locations/`, {
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