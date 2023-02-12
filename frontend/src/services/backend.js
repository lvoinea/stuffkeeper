//------------------------------------------- Login

export async function loginUser({username, password, grant_type, scope, client_id, client_secret}) {
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

