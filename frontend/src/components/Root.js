import React, {useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useNavigate, useMatch } from "react-router-dom";

import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';

import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import MoreIcon from '@mui/icons-material/MoreVert';
import AccountCircle from '@mui/icons-material/AccountCircle';

import SignIn from './SignIn';

import {getTags, getLocations} from '../services/backend';
import {setTags, setLocations} from '../services/store';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

export default function Root() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [drawer, setDrawer] = React.useState(false);

  const currentItem = useSelector((state) => state.global.selectedItem);
  const token = useSelector((state) => state.global.token);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const matchRoot = useMatch('/');
  const matchItemView = useMatch('/items/:item');
  const matchItemEdit = useMatch('/items/:item/edit');

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
    };
    fetchData();
  });

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
    <Box sx={{ flexGrow: 1 }}>
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
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search…"
                  inputProps={{ 'aria-label': 'search' }}
                />
              </Search>
          )}

          {/* ---------------------------------------------- Item name --------- */}
          { (matchItemView || matchItemEdit) && (
            <Typography sx={{ display: 'inline' }} component="span" variant="h6">
                {currentItem.name}
            </Typography>
          )}

           <Box sx={{ flexGrow: 1 }} />

          {/* ---------------------------------------------- Menu -------------- */}
          { matchRoot && (
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
                  <CloseIcon />
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
                <ListItemButton onClick={() => {navigate('/')}}>
                  <ListItemIcon>
                    <SearchIcon />
                  </ListItemIcon>
                  <ListItemText primary='Items' />
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

