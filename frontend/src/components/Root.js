import React, {useEffect, useCallback} from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useNavigate, useMatch, useSearchParams } from "react-router-dom";

import { alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from "@mui/material/InputAdornment";
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';

import CloseIcon from '@mui/icons-material/Close';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import InventoryIcon from '@mui/icons-material/Inventory';
import ListAltIcon from '@mui/icons-material/ListAlt';
import InfoIcon from '@mui/icons-material/Info';
import MenuIcon from '@mui/icons-material/Menu';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';

import SignIn from './SignIn';

import {getItems, getTags, getLocations} from '../services/backend';
import {setItemCategory, setSearchFilter, setIsMultiEdit} from '../services/store';
import {filter2search} from '../services/utils';

const MAX_RELATED = 5

export default function Root() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [drawer, setDrawer] = React.useState(false);
  const [searchStr, setSearchStr] = React.useState('');

  const currentItem = useSelector((state) => state.global.selectedItem);
  const isMultiEdit = useSelector((state) => state.global.isMultiEdit);
  const token = useSelector((state) => state.global.token);
  const visibleStats = useSelector((state) => state.global.visibleStats);
  const searchFilter = useSelector((state) => state.global.searchFilter);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const matchItems = useMatch('/');
  const matchItemView = useMatch('/items/:item');
  const matchItemEdit = useMatch('/items/:item/edit');
  const matchStats = useMatch('/stats');
  const matchAdmin = useMatch('/admin');

  const computeFilters = useCallback((searchText) => () => {
    let filters = [];
    const searchTerms = searchText.toLowerCase().split(',');
    for(let i=0; i< searchTerms.length; i++){
        const term = searchTerms[i].trim();
        if (term.length > 2) {
            if (term[1] === '.') {
               if (['t','l','n'].includes(term[0])) {
                   filters.push({
                        type: term[0],
                        term: term.substr(2).trim()
                   })
               }
            } else {
               filters.push({
                    type: 'n',
                    term: term
               });
            }
        }
    }
    dispatch(setSearchFilter(filters));
  },[dispatch]);

  useEffect(()=>{
    async function fetchData() {
        // Items
        await getItems();
        // Tags
        await getTags();
        // Locations
        await getLocations();

        const searchText = searchParams.get('search');
        if (searchText) {
            setSearchStr(searchText);
            computeFilters(searchText)();
        }
    };
    fetchData();
  },[token, dispatch, searchParams, computeFilters]);

  const toggleDrawer = (open) => (event) => {
    if (
      event &&
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }

    setDrawer( open );
  };

  const isInfoOpen = Boolean(anchorEl);
  const onInfoClose = () => {
    setAnchorEl(null);
  };

  const onInfo = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const onLogout = async () => {
    navigate('/logout')
  };

  const onClose = async () => {
    if (isMultiEdit) {
        dispatch(setIsMultiEdit(false));
    }
    else {
        navigate(-1);
    }
  };

  const onSearch = async (event) => {
    setSearchStr(event.target.value);
    setSearchParams([]);
  };

  const onKeyDown = (e) => {
      if(e.keyCode === 13){
        computeFilters(searchStr)();
      }
  };

  const onClearSearch = () => {
    setSearchStr('');
    computeFilters('')();
    setSearchParams([]);
  };

  const onSelectItems = (category) => () => {
       dispatch(setItemCategory(category));
       navigate('/');
  };

  const onStats = () => {
    navigate('/stats');
  };

  const onAdmin = () => {
    navigate('/admin');
  };

  const onInfoTag = (tagName) => () => {
    onInfoClose();
    let searchText = filter2search(searchFilter);
    if (searchText !== '') {
        searchText = `${searchText},`;
    }
    navigate({
        pathname: '/',
        search: `?search=${searchText} t.${tagName}`,
    })
   };

  const onInfoLocation = (locationName) => () => {
    onInfoClose();
    let searchText = filter2search(searchFilter);
    if (searchText !== '') {
        searchText = `${searchText},`;
    }
    navigate({
        pathname: '/',
        search: `?search=${searchText} l.${locationName}`,
    })
   };

  if(!token) {
    return <SignIn />
  }

  return (
    <React.Fragment>
    <Box sx={{ flexGrow: 1}}>
      <AppBar component="nav" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>

          {/* ---------------------------------------------- Drawer ------------ */}
          <IconButton onClick={toggleDrawer(true)}
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          {/* ---------------------------------------------- Search ------------ */}
          { matchItems && (

          <InputBase

            label="Search"
            value={searchStr}
            onChange={onSearch}
            onKeyDown={onKeyDown}
            onBlur={computeFilters(searchStr)}
            sx={{
                width: '100%',
                color: 'white',
                backgroundColor: (theme) => alpha(theme.palette.common.white, 0.15),
                borderRadius: 2,
                marginRight: '10px',
            }}
            size='medium'
            variant='standard'
            startAdornment={(
                <InputAdornment position="start">
                  <SearchIcon
                        sx={{
                            color:'#b3caf5',
                            padding: (theme) => theme.spacing(0, 0.5)
                        }}/>
                </InputAdornment>
            )}
            endAdornment={(
                <InputAdornment position="end">
                  <HighlightOffIcon onClick={onClearSearch}
                        sx={{
                          color:'#b3caf5',
                          padding: (theme) => theme.spacing(0, 0.5),
                       }}/>
                </InputAdornment>
            )}
          />

          )}

          {/* ---------------------------------------------- Item name --------- */}
          { (matchItemView || matchItemEdit) && (
            <Typography sx={{ display: 'inline' }} component="span" variant="h6">
                {currentItem.name}
            </Typography>
          )}

          {/* ---------------------------------------------- Stats ------------- */}
          { (matchStats) && (
            <Typography sx={{ display: 'inline' }} component="span" variant="h6">
                Statistics
            </Typography>
          )}

          {/* ------------------------------------------------ Admin --------- */}
          { (matchAdmin) && (
            <Typography sx={{ display: 'inline' }} component="span" variant="h6">
                Admin
            </Typography>
          )}

           <Box sx={{ flexGrow: 1 }} />

          {/* ---------------------------------------------- Info -------------- */}
          { (matchItems && !isMultiEdit) && (
              <React.Fragment>
              <Box sx={{ display: { xs: 'flex', md: 'flex' } }}>
                <IconButton
                  size="large"
                  aria-label="show more"
                  aria-haspopup="true"
                  onClick={onInfo}
                  color="inherit"
                >
                  <InfoIcon />
                </IconButton>
              </Box>
              <Dialog open={isInfoOpen} onClose={onInfoClose}>
                <DialogTitle>Selected items</DialogTitle>
                <Grid container spacing={0} sx={{paddingLeft: '10px', marginBottom: '10px'}}>
                <React.Fragment>
                    {/*--- Count ---*/}
                    <Grid xs={4} item={true}>
                        <Typography sx={{ display: 'inline' }} component="span" variant="h6" color="text.primary" align="justify">
                            Count
                        </Typography>
                    </Grid>
                    <Grid xs={8} item={true}>
                        <Typography sx={{ display: 'inline' }} component="span" variant="h6" color="text.primary" align="justify">
                           : {visibleStats.count}
                        </Typography>
                    </Grid>
                    {/*--- Cost ---*/}
                    <Grid xs={4} item={true}>
                        <Typography sx={{ display: 'inline' }} component="span" variant="h6" color="text.primary" align="justify">
                            Cost
                        </Typography>
                    </Grid>
                    <Grid xs={8} item={true}>
                        <Typography sx={{ display: 'inline' }} component="span" variant="h6" color="text.primary" align="justify">
                           : {visibleStats.cost} &#8364;
                        </Typography>
                    </Grid>
                    {/*--- Tags ---*/}
                    <Grid xs={12} item={true}>
                        <Divider variant="middle" sx={{marginTop: 2}} />
                    </Grid>
                    <Grid xs={4} item={true}>
                        <Typography sx={{ display: 'inline' }} component="span" variant="h6" color="text.primary" align="justify">
                            Tags
                        </Typography>
                    </Grid>
                    <Grid xs={8} item={true}>
                        <Typography sx={{ display: 'inline' }} component="span" variant="h6" color="text.primary" align="justify">
                           : {visibleStats.tags.length}
                        </Typography>
                        <div>
                        {visibleStats.tags.slice(0,MAX_RELATED).map(tag =>
                            <Chip key={'t_'+tag.name}
                                label={tag.name + ' (' + tag.count + ')'}
                                onClick={onInfoTag(tag.name)}
                                size="small" sx={{marginLeft: 1, marginTop: 1}} color="primary"/>
                        )}
                        {(visibleStats.tags.length > MAX_RELATED) &&
                            <span> ...</span>
                        }
                        </div>

                    </Grid>
                    {/*--- Locations ---*/}
                    <Grid xs={12} item={true}>
                        <Divider variant="middle" sx={{marginTop: 2}}/>
                    </Grid>
                    <Grid xs={4} item={true}>
                        <Typography sx={{ display: 'inline' }} component="span" variant="h6" color="text.primary" align="justify">
                            Locations
                        </Typography>
                    </Grid>
                    <Grid xs={8} item={true}>
                        <Typography sx={{ display: 'inline' }} component="span" variant="h6" color="text.primary" align="justify">
                           : {visibleStats.locations.length}
                        </Typography>
                        <div>
                        {visibleStats.locations.slice(0,MAX_RELATED).map(location =>
                            <Chip key={'l_'+location.name}
                                label={location.name + ' (' + location.count + ')'}
                                onClick={onInfoLocation(location.name)}
                                size="small" sx={{marginLeft: 1, marginTop: 1}} color="success"/>
                        )}
                        {(visibleStats.locations.length > MAX_RELATED) &&
                            <span> ...</span>
                        }
                        </div>
                    </Grid>
                    {/*-------------*/}
                </React.Fragment>
                </Grid>

              </Dialog>
              </React.Fragment>
          )}

          {/* ---------------------------------------------- Close ------------- */}
          { (matchItemEdit || isMultiEdit) && (
            <Box sx={{ display: { xs: 'flex', md: 'flex' } }}>
                <IconButton
                  size="large"
                  aria-label="show more"
                  aria-haspopup="true"
                  onClick={onClose}
                  color="inherit"
                >
                  <CloseIcon />
                </IconButton>
            </Box>
          )}


        </Toolbar>
      </AppBar>
      <Toolbar />
      <Outlet />
    </Box>
    <SwipeableDrawer
            anchor='left'
            open={drawer}
            onClose={toggleDrawer(false)}
            onOpen={toggleDrawer(true)}>

        <Box
          sx={{ width: 200 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}>
          <Toolbar />
          <List>

            <ListItem key='Items' disablePadding>
                <ListItemButton onClick={onSelectItems('active')}>
                  <ListItemIcon>
                    <ListAltIcon />
                  </ListItemIcon>
                  <ListItemText primary='Items' />
                </ListItemButton>
            </ListItem>

            <ListItem key='Archive' disablePadding>
                <ListItemButton onClick={onSelectItems('archived')}>
                  <ListItemIcon>
                    <InventoryIcon />
                  </ListItemIcon>
                  <ListItemText primary='Archive' />
                </ListItemButton>
            </ListItem>

          </List>
          <Divider />

          <List>

            <ListItem key='Stats' disablePadding>
                <ListItemButton onClick={onStats}>
                  <ListItemIcon>
                    <QueryStatsIcon />
                  </ListItemIcon>
                  <ListItemText primary='Stats' />
                </ListItemButton>
            </ListItem>

          </List>
          <Divider />

          <List>

            <ListItem key='Admin' disablePadding>
                <ListItemButton onClick={onAdmin}>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary='Admin' />
                </ListItemButton>
            </ListItem>

          </List>
          <Divider />
          <List>

            <ListItem key='Sign out' disablePadding>
                <ListItemButton onClick={onLogout}>
                  <ListItemIcon>
                    <PowerSettingsNewIcon />
                  </ListItemIcon>
                  <ListItemText primary='Sign out' />
                </ListItemButton>
            </ListItem>

          </List>
        </Box>

    </SwipeableDrawer>
    </React.Fragment>
  );
}

