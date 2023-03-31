import React from 'react';
import { useSelector } from 'react-redux'
import { Outlet, useNavigate, useMatch, ScrollRestoration } from "react-router-dom";

import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
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
  const navigate = useNavigate();
  const currentItem = useSelector((state) => state.global.selectedItem);
  const token = useSelector((state) => state.global.token);

  const matchRoot = useMatch('/');
  const matchItemView = useMatch('/items/:item');
  const matchItemEdit = useMatch('/items/:item/edit');

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
    <ScrollRestoration/>
    <Box sx={{ flexGrow: 1 }}>
      <AppBar component="nav">
        <Toolbar>

          {/* ---------------------------------------------- Drawer ------------ */}
          <IconButton
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
    </React.Fragment>
  );
}

