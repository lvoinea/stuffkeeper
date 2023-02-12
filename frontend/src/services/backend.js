//------------------------------------------- Login

export function loginUser({username, password, grant_type, scope, client_id, client_secret}) {
 return fetch('http://localhost:8000/token', {
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

export function getItems() {
  return new Promise((resolve) => {
    setTimeout(() => {
        let items = [
          {
            "id": 1,
            "name": "ciocan",
            "description": null,
            "photo_small": null,
            "quantity": 1,
            "expiration_date": null,
            "is_active": true,
            "locations": [
              {
                "name": "location A"
              }
            ]
          }
        ]
        resolve(items)
    }, 10)
  })
}
