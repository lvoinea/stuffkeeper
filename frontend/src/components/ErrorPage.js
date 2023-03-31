import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouteError } from "react-router-dom";

import {setToken} from '../services/store';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

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
            sx={{ padding: '15px', height:'80vh'}}>
      <Typography sx={{ display: 'inline' }} component="span" variant="h4" color="text.primary">
           Oops!
       </Typography>
       <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
           Sorry, an unexpected error has occurred.
       </Typography>
       <Typography sx={{ display: 'inline' }} component="span" variant="body2" color="text.primary" align="justify">
           {error.statusText || error.message}
       </Typography>

    </Stack>
  )
}