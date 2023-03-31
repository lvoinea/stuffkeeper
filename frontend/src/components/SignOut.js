import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from "react-router-dom";

import {setToken} from '../services/store';
import {deleteToken} from '../services/token';

import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function SignOut() {

  const dispatch = useDispatch();

  useEffect(() => {
    deleteToken();
    dispatch(setToken(null));
  })

  return (
    <React.Fragment>
        <Stack direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={1}
            sx={{ padding: '15px', height:'100vh'}}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                <LockOutlinedIcon />
            </Avatar>
            <Typography  component="p" variant="h6" color="text.primary" align="center">
                     You have signed out!
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              (<Link to='/'>sign in here</Link>)
            </Typography>

        </Stack>
    </React.Fragment>
  )
}