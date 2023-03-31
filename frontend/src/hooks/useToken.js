import { useState } from 'react';
import { getToken, saveToken } from '../services/token';

export default function useToken() {

  const [token, setToken] = useState(getToken());

  return {
    setToken: userToken => {
                    saveToken(userToken);
                    setToken(userToken.access_token);
              },
    token
  }
}