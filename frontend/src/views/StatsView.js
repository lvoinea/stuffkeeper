import React, {useEffect, useState} from 'react';
import { useSelector } from 'react-redux';
import { useNavigation } from "react-router-dom";

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import GlobalLoading from '../components/GlobalLoading';

import {getItems } from '../services/backend';

export default function StatsView() {

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    nrCurrentItems: 0,
    costCurrentItems: 0,
    nrArchivedItems: 0,
    costArchivedItems: 0
  });

  const token = useSelector((state) => state.global.token);

  const navigation = useNavigation();

  useEffect(() => {
    async function fetchData() {
        const l_items = await getItems({token});

        let l_stats = {
            nrCurrentItems: 0,
            costCurrentItems: 0,
            nrArchivedItems: 0,
            costArchivedItems: 0
        }

        for(let i=0; i<l_items.length; i++){
            if (l_items[i].is_active) {
                l_stats.nrCurrentItems++;
                l_stats.costCurrentItems += l_items[i].cost;
            }
            else {
                l_stats.nrArchivedItems++;
                l_stats.costArchivedItems += l_items[i].cost;
            }
        }

        setStats(l_stats);
    };
    setLoading(true);
    fetchData()
    .finally(()=> {setLoading(false)});
  }, [token]);

  return(
    <React.Fragment>

    <GlobalLoading />

   {/*------------------------------------------ Loading ------- */}
    <Backdrop
        sx={{ color: '#2c5585', backgroundColor: 'rgba(0, 0, 0, 0.1);', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
    >
        <CircularProgress color="inherit" />
    </Backdrop>

    <Stack direction="column"
            justifyContent="center"
            alignItems="flex-start"
            spacing={1}
            sx={{
                padding: '15px',
                opacity: (navigation.state === "loading") ? '0.25': '1.0',
                transition: 'opacity 200ms',
                transitionDelay: '200ms'
            }}>
        {/*--------------------------- Current Items ------------- */}
        <Typography sx={{ display: 'inline' }} component="span" variant="h6" color="text.primary">
           Current items:
        </Typography>
        <Grid container spacing={0} sx={{paddingLeft: '10px'}}>
            <React.Fragment>

            {/*--- Number ---*/}
            <Grid xs={4} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                    Number
                </Typography>
            </Grid>
            <Grid xs={8} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                   : {stats.nrCurrentItems}
                </Typography>
            </Grid>
            {/*--- Cost ---*/}
            <Grid xs={4} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                    Cost
                </Typography>
            </Grid>
            <Grid xs={8} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                   : {stats.costCurrentItems}
                </Typography>
            </Grid>

            </React.Fragment>
        </Grid>
        <Divider />
        {/*--------------------------- Archived Items ------------- */}
        <Typography sx={{ display: 'inline' }} component="span" variant="h6" color="text.primary">
           Archived items:
        </Typography>
        <Grid container spacing={0} sx={{paddingLeft: '10px'}}>
            <React.Fragment>

            {/*--- Number ---*/}
            <Grid xs={4} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                    Number
                </Typography>
            </Grid>
            <Grid xs={8} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                   : {stats.nrArchivedItems}
                </Typography>
            </Grid>
            {/*--- Cost ---*/}
            <Grid xs={4} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                    Cost
                </Typography>
            </Grid>
            <Grid xs={8} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                   : {stats.costArchivedItems}
                </Typography>
            </Grid>

            </React.Fragment>
        </Grid>
        <Divider/>

        {/*--------------------------- Locations ------------- */}
        <Typography sx={{ display: 'inline' }} component="span" variant="h6" color="text.primary">
           Locations:
        </Typography>

        <Divider/>

        {/*--------------------------- Tags ------------- */}
        <Typography sx={{ display: 'inline' }} component="span" variant="h6" color="text.primary">
           Tags:
        </Typography>

        <Divider/>

    </Stack>
    </React.Fragment>
  );
}