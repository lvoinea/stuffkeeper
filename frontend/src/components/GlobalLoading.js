import React from 'react';
import { useNavigation} from "react-router-dom";

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export default function GlobalLoading() {

  const navigation = useNavigation();

  return(
  <React.Fragment>

    {(navigation.state === "loading") && (
        <Box style={{position: 'absolute', transform: 'translate(-50%)',
              top: '50%',
              left: '50%'}}>
            <CircularProgress color="inherit" thickness={8} />
        </Box>
    )}

  </React.Fragment>
  );
}