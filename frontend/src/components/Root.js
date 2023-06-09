import React, {useEffect, useCallback} from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useNavigate, useMatch, useSearchParams } from "react-router-dom";

import { alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from "@mui/material/InputAdornment";
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';

import AccountCircle from '@mui/icons-material/AccountCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ClearIcon from '@mui/icons-material/Clear';
import InventoryIcon from '@mui/icons-material/Inventory';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MenuIcon from '@mui/icons-material/Menu';
import MoreIcon from '@mui/icons-material/MoreVert';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import SearchIcon from '@mui/icons-material/Search';

import SignIn from './SignIn';

import {getTags, getLocations} from '../services/backend';
import {setTags, setLocations, setItemCategory, setSearchFilter} from '../services/store';


export default function Root() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [drawer, setDrawer] = React.useState(false);
  const [searchStr, setSearchStr] = React.useState('');

  const currentItem = useSelector((state) => state.global.selectedItem);
  const token = useSelector((state) => state.global.token);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const matchRoot = useMatch('/');
  const matchItemView = useMatch('/items/:item');
  const matchItemEdit = useMatch('/items/:item/edit');
  const matchStats = useMatch('/stats');

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
  });

  useEffect(()=>{
    async function fetchData() {
        // Tags
        let tags = await getTags({token});
        tags = tags.map((tag) => { return { name: tag.name}});
        dispatch(setTags(tags));
        // Locations
        let locations = await getLocations({token});
        locations = locations.map((location) => { return { name: location.name}});
        dispatch(setLocations(locations));
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

  const isMenuOpen = Boolean(anchorEl);
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLogout = async () => {
    navigate('/logout')
  };

  const handleClose = async () => {
    navigate(-1);
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

  const clearSearch = () => {
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
  }

  const menuId = 'toolbar-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}

      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleLogout}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Sign out</p>
      </MenuItem>
    </Menu>
  );

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
          { matchRoot && (

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
                            color:'white',
                            padding: (theme) => theme.spacing(0, 0.5)
                        }}/>
                </InputAdornment>
            )}
            endAdornment={(
                <InputAdornment position="end">
                  <ClearIcon onClick={clearSearch}
                        sx={{
                          color:'white',
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

           <Box sx={{ flexGrow: 1 }} />

          {/* ---------------------------------------------- Menu -------------- */}
          { (matchRoot || matchStats)&& (
              <Box sx={{ display: { xs: 'flex', md: 'flex' } }}>
                <IconButton
                  size="large"
                  aria-label="show more"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  onClick={handleMenuOpen}
                  color="inherit"
                >
                  <MoreIcon />
                </IconButton>
              </Box>
          )}

          {/* ---------------------------------------------- Close ------------- */}
          { (matchItemView || matchItemEdit) && (
            <Box sx={{ display: { xs: 'flex', md: 'flex' } }}>
                <IconButton
                  size="large"
                  aria-label="show more"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  onClick={handleClose}
                  color="inherit"
                >
                  <ArrowBackIcon />
                </IconButton>
            </Box>
          )}


        </Toolbar>
      </AppBar>
      <Toolbar />
      {renderMenu}
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

            <ListItem key='Sign out' disablePadding>
                <ListItemButton onClick={handleLogout}>
                  <ListItemIcon>
                    <AccountCircle />
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

