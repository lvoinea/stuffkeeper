import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouteError } from "react-router-dom";

import {setToken} from '../services/store';

import Stack from '@mui/material/Stack';

export default function ErrorPage() {
  const error = useRouteError();
  const token = useSelector((state) => state.global.token);

  useEffect(() => {
     if (token && (error.code === 401)) {
        setToken(null);
     };
  })

  return (
    <Stack direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={1}
            sx={{ padding: '15px', height:'100vh'}}>
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </Stack>
  )
}