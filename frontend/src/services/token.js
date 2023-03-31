export function getToken() {
    const tokenString = localStorage.getItem('token');
    const userToken = JSON.parse(tokenString);
    return userToken;
};

export function saveToken( userToken ) {
    localStorage.setItem('token', JSON.stringify(userToken));
};

export function deleteToken( userToken ) {
    localStorage.removeItem('token');
};