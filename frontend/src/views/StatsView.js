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
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';

import { Chart } from "react-google-charts";

import GlobalLoading from '../components/GlobalLoading';

import {getItems } from '../services/backend';

const TOP_ENTRIES = 10;
const BAR_LENGTH = 120;

const tagPieChartOptions = {
  sliceVisibilityThreshold: 0.1,
  chartArea: {width: '100%', height: '80%'},
  legend: {position: 'bottom'}
};

const locationPieChartOptions = {
  sliceVisibilityThreshold: 0.1,
  chartArea: {width: '100%', height: '80%'},
  legend: {position: 'bottom'}
};

export default function StatsView() {

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    nrCurrentItems: 0,
    costCurrentItems: 0,
    nrArchivedItems: 0,
    costArchivedItems: 0,
    topTags: [],
    topLocations: [],
    maxTagMetric: 0,
    maxLocationMetric: 0
  });

  const [tagMetric, setTagMetric] = React.useState('cost');
  const [tagFilter, setTagFilter] = React.useState('top 10');
  const [tagNumber, setTagNumber] = React.useState(0);
  const [tagPieChart, setTagPieChart] = React.useState([['Tag','Metric']]);

  const [locationMetric, setLocationMetric] = React.useState('cost');
  const [locationFilter, setLocationFilter] = React.useState('top 10');
  const [locationNumber, setLocationNumber] = React.useState(0);
  const [locationPieChart, setLocationPieChart] = React.useState([['Location','Metric']]);

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
            topLocations: [],
            maxTagMetric: 0,
            maxLocationMetric: 0,
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
        tags.forEach(tag => {l_tags[tag.name] = {count: 0, cost: 0}});
        for(let i=0; i<l_items.length; i++){
            for(let j=0; j<l_items[i].tags.length; j++){
                let tagName = l_items[i].tags[j].name
                l_tags[tagName].count += 1
                l_tags[tagName].cost += l_items[i].cost
            }
        }
        for (const [key, value] of Object.entries(l_tags)) {
            l_stats.topTags.push({
                name: key,
                count: value.count,
                cost: value.cost,
            })
        }

        // Top locations
        let l_locations = {};
        locations.forEach(location => {l_locations[location.name] = {count: 0, cost: 0}});
        for(let i=0; i<l_items.length; i++){
            for(let j=0; j<l_items[i].locations.length; j++){
                let locationName = l_items[i].locations[j].name
                l_locations[locationName].count += 1
                l_locations[locationName].cost += l_items[i].cost
            }
        }
        for (const [key, value] of Object.entries(l_locations)) {
            l_stats.topLocations.push({
                name: key,
                count: value.count,
                cost: value.cost,
            })
        }

        // Sort the tags on the selected metric and find the largest value
        // to be used as reference for the bar chart.
        if (tagMetric === 'cost') {
            l_stats.topTags.sort((a,b) => b.cost-a.cost);
            setTagPieChart([['Tag','Metric']].concat(l_stats.topTags.map(t => [t.name, t.cost])));
        }
        else {
            l_stats.topTags.sort((a,b) => b.count-a.count);
            setTagPieChart([['Tag','Metric']].concat(l_stats.topTags.map(t => [t.name, t.count])));
        }

        if (l_stats.topTags.length > 0) {
            l_stats.maxTagMetric = l_stats.topTags[0][tagMetric]
        }

        // Sort the locations on the selected metric and find the largest value
        // to be used as reference for the bar chart.
        if (locationMetric === 'cost') {
            l_stats.topLocations.sort((a,b) => b.cost-a.cost);
            setLocationPieChart([['Location','Metric']].concat(l_stats.topLocations.map(t => [t.name, t.cost])));
        }
        else {
            l_stats.topLocations.sort((a,b) => b.count-a.count);
            setLocationPieChart([['Location','Metric']].concat(l_stats.topLocations.map(t => [t.name, t.count])));
        }

        if (l_stats.topLocations.length > 0) {
            l_stats.maxLocationMetric = l_stats.topLocations[0][locationMetric]
        }

        // Set the number of entries in the reports
        if (tagFilter === 'top 10'){
            setTagNumber(TOP_ENTRIES);
        }
        else {
            setTagNumber(l_stats.topTags.length);
        }

        if (locationFilter === 'top 10'){
            setLocationNumber(TOP_ENTRIES);
        }
        else {
            setLocationNumber(l_stats.topLocations.length);
        }

        setStats(l_stats);
    };
    setLoading(true);
    fetchData()
    .finally(()=> {setLoading(false)});
  }, [token, tags, locations, tagMetric, tagFilter, locationMetric, locationFilter]);

  const onTag = (tagName) => () => {
    navigate({
        pathname: '/',
        search: `?search=t.${tagName}`,
    })
  };
  const onTagMetric = (event) => {
    setTagMetric(event.target.value);
  };
  const onTagFilter = (event) => {
    setTagFilter(event.target.value);
  };

  const onLocation = (locationName) => () => {
    navigate({
        pathname: '/',
        search: `?search=l.${locationName}`,
    })
  };
  const onLocationMetric = (event) => {
    setLocationMetric(event.target.value);
  };
   const onLocationFilter = (event) => {
    setLocationFilter(event.target.value);
  };

  return(
    <React.Fragment>

    <GlobalLoading />

   {/*------------------------------------------ Loading ------- */}
    <Backdrop
        sx={{ color: '#2c5585', backgroundColor: 'rgba(0, 0, 0, 0.1);', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}>
        <CircularProgress color="inherit" thickness={8} />
    </Backdrop>

    {/*--------------------------- Active Items ------------- */}
    <Paper elevation={4} sx={{ padding: '10px', margin: '5px'}}>
        <Stack direction="row" justifyContent="flex-start" alignItems="center">
            <ListAltIcon sx={{ marginRight: '10px',  opacity: 0.3}} />
            <Typography sx={{ display: 'inline' }} component="span" variant="h5" color="text.primary">
               Items: {stats.nrCurrentItems}
            </Typography>
        </ Stack>
        <Grid container spacing={0} sx={{paddingLeft: '10px', marginTop: '10px'}}>
            <React.Fragment>
            {/*--- Cost ---*/}
            <Grid xs={4} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                    Cost
                </Typography>
            </Grid>
            <Grid xs={8} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                   {stats.costCurrentItems} &#8364;
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
               Archived:  {stats.nrArchivedItems}
            </Typography>
        </ Stack>
        <Grid container spacing={0} sx={{paddingLeft: '10px', marginTop: '10px'}}>
            <React.Fragment>
            {/*--- Cost ---*/}
            <Grid xs={4} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                    Cost
                </Typography>
            </Grid>
            <Grid xs={8} item={true}>
                <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                   {stats.costArchivedItems} &#8364;
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
               Tags: {tags.length}
            </Typography>
        </ Stack>
        <Grid container spacing={0} sx={{paddingLeft: '10px', marginTop: '10px'}}>
            <React.Fragment>

            <Chart
              chartType="PieChart"
              data={tagPieChart}
              options={tagPieChartOptions}
              width={"100%"}
              height={"300px"}
            />

            {/*---- Top ----*/}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%'}}>

                <Select size='small' variant="standard" value={tagFilter} onChange={onTagFilter}>
                    <MenuItem value='top 10'>
                        Top {(tags.length > TOP_ENTRIES)?TOP_ENTRIES:tags.length}
                    </MenuItem>
                    <MenuItem value='all'>All</MenuItem>
                </Select>

                <Select size='small' variant="standard" value={tagMetric} onChange={onTagMetric}>
                    <MenuItem value='cost'>Cost</MenuItem>
                    <MenuItem value='count'>Count</MenuItem>
                </Select>
            </Stack>

            <Stack direction="column" justifyContent="flex-start" alignItems="flex-start" sx={{paddingLeft: '20px', paddingTop: '10px'}}>
            {stats.topTags.slice(0,tagNumber).map(tag => (
                <Stack direction="row" key={'t.'+tag.name} onClick={onTag(tag.name)}>

                <Typography
                    sx={{
                        display: 'inline-block',
                        width: '80px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginRight: '10px'
                    }}
                    component="span" variant="body1" color="text.primary" align="justify">
                    {tag.name}
                </Typography>

                {/*---------- Tags on cost -- */}
                {(tagMetric === 'cost') &&
                    <React.Fragment>
                    <div
                        style={{
                            width: tag.cost * BAR_LENGTH / stats.maxTagMetric,
                            backgroundColor: alpha('#16649c', 0.15),
                            borderRadius: '5px',
                            paddingLeft: 5,
                            margin: 1
                        }}>

                    </ div>
                    <Typography sx={{ display: 'inline' , paddingLeft: '10px'}} component="span" variant="body1" color="text.primary" align="justify">
                        {tag.cost}  &#8364;
                    </Typography>
                    </React.Fragment>
                }
                {/*---------- Tags on count -- */}
                {(tagMetric === 'count') &&
                    <React.Fragment>
                    <div
                        style={{
                            width: tag.count * BAR_LENGTH / stats.maxTagMetric,
                            backgroundColor: alpha('#16649c', 0.15),
                            borderRadius: '5px',
                            paddingLeft: 5,
                            margin: 1
                        }}>

                    </ div>
                    <Typography sx={{ display: 'inline' , paddingLeft: '10px'}} component="span" variant="body1" color="text.primary" align="justify">
                        {tag.count}
                    </Typography>
                    </React.Fragment>
                }
                {/*--------------------------- */}


                </Stack>
            ))}
            </ Stack>
            </React.Fragment>
        </Grid>
     </Paper>
    {/*--------------------------- Locations ------------- */}
    <Paper elevation={4} sx={{ padding: '10px',  margin: '15px 5px 5px 5px'}}>
        <Stack direction="row" justifyContent="flex-start" alignItems="center">
            <LocationOnIcon sx={{ marginRight: '10px',  opacity: 0.3}} />
            <Typography sx={{ display: 'inline' }} component="span" variant="h5" color="text.primary">
               Locations:  {locations.length}
            </Typography>
        </ Stack>
        <Grid container spacing={0} sx={{paddingLeft: '10px', marginTop: '10px'}}>
            <React.Fragment>

            <Chart
              chartType="PieChart"
              data={locationPieChart}
              options={locationPieChartOptions}
              width={"100%"}
              height={"300px"}
            />

            {/*---- Top ----*/}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%'}}>

                <Select size='small' variant="standard" value={locationFilter} onChange={onLocationFilter}>
                    <MenuItem value='top 10'>
                        Top {(locations.length > TOP_ENTRIES)?TOP_ENTRIES:locations.length}
                    </MenuItem>
                    <MenuItem value='all'>All</MenuItem>
                </Select>

                <Select size='small' variant="standard" value={locationMetric} onChange={onLocationMetric}>
                    <MenuItem value='cost'>Cost</MenuItem>
                    <MenuItem value='count'>Count</MenuItem>
                </Select>
            </Stack>

            <Stack direction="column" justifyContent="flex-start" alignItems="flex-start" sx={{paddingLeft: '20px', paddingTop: '10px'}}>
            {stats.topLocations.slice(0,locationNumber).map(location => (
                <Stack direction="row" key={'l.'+location.name} onClick={onLocation(location.name)}>

                <Typography
                    sx={{
                        display: 'inline-block',
                        width: '80px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginRight: '10px',
                        whiteSpace:'nowrap'
                    }}
                    component="span" variant="body1" color="text.primary" align="justify">
                    {location.name}
                </Typography>

                {/*---------- Locations on cost -- */}
                {(locationMetric === 'cost') &&
                    <React.Fragment>
                    <div
                        style={{
                            width: location.cost * BAR_LENGTH / stats.maxLocationMetric,
                            backgroundColor: alpha('#16649c', 0.15),
                            borderRadius: '5px',
                            paddingLeft: 5,
                            margin: 1
                        }}>

                    </ div>
                    <Typography sx={{ display: 'inline' , paddingLeft: '10px'}} component="span" variant="body1" color="text.primary" align="justify">
                        {location.cost} &#8364;
                    </Typography>
                    </React.Fragment>
                }
                {/*---------- Locations on count -- */}
                {(locationMetric === 'count') &&
                    <React.Fragment>
                    <div
                        style={{
                            width: location.count * BAR_LENGTH / stats.maxLocationMetric,
                            backgroundColor: alpha('#16649c', 0.15),
                            borderRadius: '5px',
                            paddingLeft: 5,
                            margin: 1
                        }}>

                    </ div>
                    <Typography sx={{ display: 'inline' , paddingLeft: '10px'}} component="span" variant="body1" color="text.primary" align="justify">
                        {location.count}
                    </Typography>
                    </React.Fragment>
                }
                {/*--------------------------- */}


                </Stack>
            ))}
            </ Stack>
            </React.Fragment>
        </Grid>
    </Paper>

    {/*---------------------------------------- */}

    </React.Fragment>
  );
}