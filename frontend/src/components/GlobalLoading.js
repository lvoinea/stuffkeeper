import React from 'react';
import { useSelector } from 'react-redux'
import { useNavigation} from "react-router-dom";

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export default function GlobalLoading() {

  const navigation = useNavigation();
  const isLoading = useSelector((state) => state.global.isLoading);

  return(
  <React.Fragment>

    {((navigation.state === "loading") || isLoading) && (
        <Box style={{position: 'absolute', transform: 'translate(-50%)',
                color: '#1d6fcf',
                backgroundColor: 'rgba(0, 0, 0, 0.1);',
                top: '50%',
                left: '50%'}}>
            <CircularProgress color="inherit" thickness={8} />
        </Box>
    )}

  </React.Fragment>
  );
}