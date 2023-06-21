import React, {useEffect, useState} from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";

import { alpha } from "@mui/material";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import InventoryIcon from '@mui/icons-material/Inventory';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import GlobalLoading from '../components/GlobalLoading';

import {getItems } from '../services/backend';

const TOP_ENTRIES=10;

export default function StatsView() {

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    nrCurrentItems: 0,
    costCurrentItems: 0,
    nrArchivedItems: 0,
    costArchivedItems: 0,
    topTags: [],
    maxTagCount: 0
  });

  const token = useSelector((state) => state.global.token);
  const tags = useSelector((state) => state.global.tags);
  const locations = useSelector((state) => state.global.locations);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
        const l_items = await getItems({token});

        let l_stats = {
            nrCurrentItems: 0,
            costCurrentItems: 0,
            nrArchivedItems: 0,
            costArchivedItems: 0,
            topTags: [],
            maxTagCount: 0
        }

        // Basic metrics
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

        // Top tags
        let l_tags = {};
        tags.forEach(tag => {l_tags[tag.name] = 0});
        for(let i=0; i<l_items.length; i++){
            for(let j=0; j<l_items[i].tags.length; j++){
                l_tags[l_items[i].tags[j].name] += 1
            }
        }
        for (const [key, value] of Object.entries(l_tags)) {
            l_stats.topTags.push({
                name: key,
                count: value,
            })
        }
        l_stats.topTags.sort((a,b) => b.count-a.count);
        if (l_stats.topTags.length > 0) {
            l_stats.maxTagCount = l_stats.topTags[0].count
        }

        setStats(l_stats);
    };
    setLoading(true);
    fetchData()
    .finally(()=> {setLoading(false)});
  }, [token, tags, locations]);

  const onTag = (tagName) => () => {
    navigate({
        pathname: '/',
        search: `?search=t.${tagName}`,
    })
  };

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

    {/*--------------------------- Active Items ------------- */}
    <Paper elevation={4} sx={{ padding: '10px', margin: '5px'}}>
        <Stack direction="row" justifyContent="flex-start" alignItems="center">
            <ListAltIcon sx={{ marginRight: '10px',  opacity: 0.3}} />
            <Typography sx={{ display: 'inline' }} component="span" variant="h5" color="text.primary">
               Items
            </Typography>
        </ Stack>
        <Grid container spacing={0} sx={{paddingLeft: '10px'}}>
            <React.Fragment>

            {/*--- Number ---*/}
            <Grid xs={4} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                    Count
                </Typography>
            </Grid>
            <Grid xs={8} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                   {stats.nrCurrentItems}
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
                   {stats.costCurrentItems} EUR
                </Typography>
            </Grid>
            {/*-------------*/}
            </React.Fragment>
        </Grid>
    </Paper>

    {/*--------------------------- Archived Items ------------- */}
    <Paper elevation={4} sx={{ padding: '10px', margin: '15px 5px 5px 5px'}}>
      <Stack direction="row" justifyContent="flex-start" alignItems="center">
            <InventoryIcon sx={{ marginRight: '10px',  opacity: 0.3}} />
            <Typography sx={{ display: 'inline' }} component="span" variant="h5" color="text.primary">
               Archived
            </Typography>
        </ Stack>
        <Grid container spacing={0} sx={{paddingLeft: '10px'}}>
            <React.Fragment>
            {/*--- Number ---*/}
            <Grid xs={4} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                    Count
                </Typography>
            </Grid>
            <Grid xs={8} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                   {stats.nrArchivedItems}
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
                   {stats.costArchivedItems} EUR
                </Typography>
            </Grid>
            {/*-------------*/}
            </React.Fragment>
        </Grid>
    </Paper>

    {/*--------------------------- Locations ------------- */}
    <Paper elevation={4} sx={{ padding: '10px',  margin: '15px 5px 5px 5px'}}>
        <Stack direction="row" justifyContent="flex-start" alignItems="center">
            <LocationOnIcon sx={{ marginRight: '10px',  opacity: 0.3}} />
            <Typography sx={{ display: 'inline' }} component="span" variant="h5" color="text.primary">
               Locations
            </Typography>
        </ Stack>
        <Grid container spacing={0} sx={{paddingLeft: '10px'}}>
            <React.Fragment>
            {/*--- Number ---*/}
            <Grid xs={4} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                    Count
                </Typography>
            </Grid>
            <Grid xs={8} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                   {locations.length}
                </Typography>
            </Grid>
            {/*-------------*/}
            </React.Fragment>
        </Grid>
    </Paper>

    {/*--------------------------- Tags ------------- */}
    <Paper elevation={4} sx={{ padding: '10px', margin: '15px 5px 5px 5px'}}>
        <Stack direction="row" justifyContent="flex-start" alignItems="center">
            <LocalOfferIcon sx={{ marginRight: '10px',  opacity: 0.3}} />
            <Typography sx={{ display: 'inline' }} component="span" variant="h5" color="text.primary">
               Tags
            </Typography>
        </ Stack>
        <Grid container spacing={0} sx={{paddingLeft: '10px'}}>
            <React.Fragment>
            {/*--- Number ---*/}
            <Grid xs={4} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                    Count
                </Typography>
            </Grid>
            <Grid xs={8} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                   {tags.length}
                </Typography>
            </Grid>
            {/*---- Top ----*/}
            <Grid xs={4} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                    Top {(tags.length > TOP_ENTRIES)?TOP_ENTRIES:tags.length}
                </Typography>
            </Grid>

            <Stack direction="column" justifyContent="flex-start" alignItems="flex-start" sx={{paddingLeft: '20px', paddingTop: '10px'}}>
            {stats.topTags.slice(0,TOP_ENTRIES).map(tag => (
                <Stack direction="row" key={tag.name}>
                <div onClick={onTag(tag.name)}
                    style={{
                        width: tag.count * 200 / stats.maxTagCount,
                        backgroundColor: alpha('#16649c', 0.15),
                        borderRadius: '5px',
                        paddingLeft: 5,
                        margin: 1
                    }}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                    {tag.name}
                </Typography>
                </ div>
                <Typography sx={{ display: 'inline' , paddingLeft: '10px'}} component="span" variant="body1" color="text.primary" align="justify">
                    {tag.count}
                </Typography>
                </Stack>
            ))}
            </ Stack>
            </React.Fragment>
        </Grid>
    </Paper>

    </React.Fragment>
  );
}