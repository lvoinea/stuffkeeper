import React, {useState} from 'react';
import { useSelector } from 'react-redux';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import GlobalLoading from '../components/GlobalLoading';

import {renameTag, renameLocation} from '../services/backend';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function AdminView() {

    const [isTagRenameOpen, setIsTagRenameOpen] = useState(false);
    const [isLocationRenameOpen, setIsLocationRenameOpen] = useState(false);
    const [srcTagName, setSrcTagName] = useState('');
    const [dstTagName, setDstTagName] = useState('');
    const [srcLocationName, setSrcLocationName] = useState('');
    const [dstLocationName, setDstLocationName] = useState('');

    const globalTags = useSelector((state) => state.global.tags);
    const globalLocations = useSelector((state) => state.global.locations);

    //--- Tags
    const onRenameTagOpen = () => {
        setIsTagRenameOpen(true);
    };

    const onTagRenameExecute = async (event) => {
        event.preventDefault();

        onTagRenameClose();
        await renameTag(srcTagName, dstTagName);
    };

    const onTagRenameClose = () => {
        setSrcTagName('');
        setDstTagName('');
        setIsTagRenameOpen(false);
    };

    //--- Locations

    const onRenameLocationOpen = () => {
        setIsLocationRenameOpen(true);
    };

    const onLocationRenameExecute = async (event) => {
        event.preventDefault();

        onLocationRenameClose();
        await renameLocation(srcLocationName, dstLocationName);
    };

    const onLocationRenameClose = () => {
        setSrcLocationName('');
        setDstLocationName('');
        setIsLocationRenameOpen(false);
    };

return(
    <React.Fragment>
    <GlobalLoading />

    {/*--------------------------- Tags ------------- */}
    <Paper elevation={4} sx={{ padding: '10px', margin: '5px'}}>
        <Stack direction="row" justifyContent="flex-start" alignItems="center">
            <LocalOfferIcon sx={{ marginRight: '10px',  opacity: 0.3}} />
            <Typography sx={{ display: 'inline' }} component="span" variant="h5" color="text.primary">
               Tags
            </Typography>
        </ Stack>

        <Stack direction="column" justifyContent="flex-start" alignItems="flex-start" sx={{marginTop: 1, marginRight:1}}>
            <Button variant="text"  onClick={onRenameTagOpen}>Rename a tag</Button>
        </Stack>
    </Paper>

    <Dialog open={isTagRenameOpen} onClose={onTagRenameClose} fullWidth>
        <DialogTitle>Rename a tag</DialogTitle>
        <form onSubmit={onTagRenameExecute}>

            <Stack direction="column" justifyContent="center" alignItems="center" spacing={2} sx={{margin: 1.5, width: '90%'}}>
            <FormControl variant="outlined" sx={{ width: '100%' }}>
            <InputLabel id="select-tag">From</InputLabel>
            <Select name="tags" fullWidth
                labelId="select-tag"
                label="From"
                id='select-tag'
                value={srcTagName}
                onChange={(event) => {
                    setSrcTagName(event.target.value);
                }}
                MenuProps={MenuProps}
            >
                {globalTags.map(tag => tag.name).sort().map(tag => (
                    <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                ))}
            </Select>
            <TextField label="To" variant="outlined" sx={{marginTop: 2}}
                value={dstTagName}
                onChange={(event) => {
                    setDstTagName(event.target.value);
                }}
                />
            <Button variant="text" type="submit" sx={{marginTop: 3}}
                disabled={(srcTagName==='' || dstTagName==='')}>
                Rename
            </Button>
            </FormControl>
            </Stack>
    </form>
    </Dialog>

    {/*--------------------------- Locations ------------- */}
    <Paper elevation={4} sx={{ padding: '10px', margin: '15px 5px 5px 5px'}}>
        <Stack direction="row" justifyContent="flex-start" alignItems="center">
            <LocationOnIcon sx={{ marginRight: '10px',  opacity: 0.3}} />
            <Typography sx={{ display: 'inline' }} component="span" variant="h5" color="text.primary">
               Locations
            </Typography>
        </ Stack>

        <Stack direction="column" justifyContent="flex-start" alignItems="flex-start" sx={{marginTop: 1, marginRight:1}}>
            <Button variant="text"  onClick={onRenameLocationOpen}>Rename a location</Button>
        </Stack>
    </Paper>

    <Dialog open={isLocationRenameOpen} onClose={onLocationRenameClose} fullWidth>
        <DialogTitle>Rename a location</DialogTitle>
        <form onSubmit={onLocationRenameExecute}>

            <Stack direction="column" justifyContent="center" alignItems="center" spacing={2} sx={{margin: 1.5, width: '90%'}}>
            <FormControl variant="outlined" sx={{ width: '100%' }}>
            <InputLabel id="select-location">From</InputLabel>
            <Select name="locations" fullWidth
                labelId="select-location"
                label="From"
                id='select-location'
                value={srcLocationName}
                onChange={(event) => {
                    setSrcLocationName(event.target.value);
                }}
                MenuProps={MenuProps}
            >
                {globalLocations.map(location => location.name).sort().map(location => (
                    <MenuItem key={location} value={location}>{location}</MenuItem>
                ))}
            </Select>
            <TextField label="To" variant="outlined" sx={{marginTop: 2}}
                value={dstLocationName}
                onChange={(event) => {
                    setDstLocationName(event.target.value);
                }}
                />
            <Button variant="text" type="submit" sx={{marginTop: 3}}
                disabled={(srcLocationName==='' || dstLocationName==='')}>
                Rename
            </Button>
            </FormControl>
            </Stack>
    </form>
    </Dialog>

    </React.Fragment>
  );
}