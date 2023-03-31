
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

export function getItems({token}) {
  if (token) {
    return fetch(`http://${backendAddress}/users/me/items/`, {
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

export function loadItem({token, id}) {
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
    }
    return response.text().then(text => {throw new ApplicationException({code: response.status, message:text})})
  })
}