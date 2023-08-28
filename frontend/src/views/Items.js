import React, {useEffect, useState, useCallback} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";

import Autocomplete from '@mui/material/Autocomplete';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import Stack from '@mui/material/Stack';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import InventoryIcon from '@mui/icons-material/Inventory';
import LaunchIcon from '@mui/icons-material/Launch';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RemoveDoneIcon from '@mui/icons-material/RemoveDone';
import UnarchiveIcon from '@mui/icons-material/Unarchive';

import {getItems, addItem, checkTag } from '../services/backend';
import {setSelectedItem, setYItems, setVisibleStats, setIsMultiEdit} from '../services/store';


export default function Items() {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editSelection, setEditSelection] = useState({});
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isTagOpen, setIsTagOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tags, setTags] = useState([]);
  const [locations, setLocations] = useState([]);
  const [inputTag, setInputTag] = useState('');
  const [inputLocation, setInputLocation] = useState('');

  const token = useSelector((state) => state.global.token);
  const globalTags = useSelector((state) => state.global.tags);
  const globalLocations = useSelector((state) => state.global.locations);
  const scrollPosition = useSelector((state) => state.global.itemsY);
  const itemCategory = useSelector((state) => state.global.itemCategory);
  const isMultiEdit = useSelector((state) => state.global.isMultiEdit);
  const currentItem = useSelector((state) => state.global.selectedItem);
  const searchFilter = useSelector((state) => state.global.searchFilter);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getThumbnail = (item) => {
    if (item.photos?.thumbnail) {
        return 'data:image/jpeg;base64,' + item.photos.thumbnail;
    } else {
        // If the thumbnail is not available replace it with a standard image
        return 'no-image-icon.gif';
    }
  }

  const onAddItem = useCallback(async () => {
    const newItem = {
      "name": "",
      "description": "",
      "quantity": 1,
      "cost": 0,
      "photos": {
        "sources": []
      }
    }
    const addedItem = await addItem({token, item: newItem});
    dispatch(setSelectedItem({name: addedItem.name, id: addedItem.id}));
    dispatch(setYItems(window.pageYOffset));
    navigate(`/items/${addedItem.id}/edit`);
  }, [dispatch, navigate, token]);

  const onMultiEdit = useCallback(async () => {
    dispatch(setIsMultiEdit(true));
    setIsMenuOpen(false);
  }, [dispatch]);

  const isVisible = useCallback((item) => {
    let visible = (itemCategory === 'active' && item.is_active) ||
        (itemCategory === 'archived' && !item.is_active);

    const itemName = item.name.toLowerCase()
    for(let i=0; i<searchFilter.length; i++){
        const filter = searchFilter[i]
        // Check name
        if (filter.type === 'n'){
            visible = visible && (itemName.search(filter.term) >= 0)
        }
        // Check tags
        else if (filter.type === 't'){
            let visibleTag = false;
            for(let j=0; j<item.tags.length; j++){
                visibleTag = visibleTag || (item.tags[j].name === filter.term);
                if (visibleTag) break;
            }
            visible = visible && visibleTag;
        }
        // Check location
        else if (filter.type === 'l'){
            let visibleLocation = false;
            for(let j=0; j<item.locations.length; j++){
                visibleLocation = visibleLocation || (item.locations[j].name === filter.term);
                if (visibleLocation) break;
            }
            visible = visible && visibleLocation;
        }
        if (!visible) break;
    }
    return visible
  }, [itemCategory, searchFilter]);

  const onMenuOpen = (event) => {
    if (event.type === 'click'){
        setIsMenuOpen(true);
    }
  };

  const onMenuClose = () => {
    setIsMenuOpen(false);
  };

  const onSelectionChange = (itemId) => () => {
    setEditSelection({
        ...editSelection,
        [itemId]: !editSelection[itemId]
    });
  };

  const onSelectAll = useCallback(() => {
    setIsMenuOpen(false);
    let l_editSelection = {};
    Object.keys(editSelection).forEach( key => l_editSelection[key] = true);
    setEditSelection(l_editSelection);
  }, [editSelection]);

  const onClearAll = useCallback(() => {
    setIsMenuOpen(false);
    let l_editSelection = {};
    Object.keys(editSelection).forEach( key => l_editSelection[key] = false);
    setEditSelection(l_editSelection);
  },[editSelection]);

  const handleSelectItem = (item) => () => {
    if (isMultiEdit) {
        onSelectionChange(item.id)();
    }
    else {
        dispatch(setSelectedItem({name: item.name, id: item.id}));
        dispatch(setYItems(window.pageYOffset));
        navigate(`/items/${item.id}`);
    };
  };

  const getCommonTags = useCallback(() => {

    // Get tags from the selected items
    let selectedCount = 0;
    let l_tags = {}
    items.forEach(item => {
        if (editSelection[item.id]) {
            selectedCount += 1;
            for(let i=0; i<item.tags.length; i++){
                let tagName = item.tags[i].name
                l_tags[tagName] = l_tags[tagName] || 0;
                l_tags[tagName] += 1;
            }
        }
    });

    // Extract tags that occur in all selected items
    let commonTags=[];
    Object.entries(l_tags).forEach(tag => {
        if (tag[1] === selectedCount) {
            commonTags.push({
                name: tag[0]
            });
        }
    });

    return commonTags;
  },[items, editSelection]);

  const onTagOpen = useCallback(() => {
     setIsMenuOpen(false);
     let commonTags = getCommonTags();
     setTags(commonTags);
     setIsTagOpen(true);
  },[getCommonTags]);
  
  const onTagClose = () => {
     setIsTagOpen(false);
  };
  
  const onTagExecute = async (event) => {
    event.preventDefault();
    let needsSaving = false;
     if (needsSaving){
        setIsSaving(true);
        setIsSaving(false);
    };
    setTags([]);
    setIsTagOpen(false);
  };

  const onMoveOpen = () => {
     setIsMenuOpen(false);
     setIsMoveOpen(true);
  };

  const onMoveClose = () => {
    setIsMoveOpen(false);
  };

  const onMoveExecute = async (event) => {
    event.preventDefault();
    let needsSaving = false;
    if (needsSaving){
        setIsSaving(true);
        setIsSaving(false);
    };
    setIsMoveOpen(false);
  };

  const onRestoreSelection = () => {
     setIsMenuOpen(false);
  };

  const onDeleteSelection = () => {
     setIsMenuOpen(false);
  };

  const isItemsSelected = useCallback(() => {
    return Object.values(editSelection).some(item => item);
  }, [editSelection]);

  useEffect(() => {
    async function fetchData() {
        const l_items = await getItems({token});
        setItems(l_items);
        setTimeout(() => {
            window.scrollTo(0, scrollPosition);
        });

        // Compute visible items stats
        let stats = {count: 0, cost: 0, tags: 0, locations: 0}
        let l_tags = {}
        let l_locations = {}
        let l_editSelection = {}
        l_items.forEach(item => {
            if (isVisible(item)) {
                stats.count += 1;
                stats.cost += item.cost;
                for(let i=0; i<item.tags.length; i++){
                    let tagName = item.tags[i].name
                    l_tags[tagName] = l_tags[tagName] || {count: 0}
                    l_tags[tagName].count += 1
                }
                for(let i=0; i<item.locations.length; i++){
                    let locationName = item.locations[i].name
                    l_locations[locationName] = l_locations[locationName] || {count: 0};
                    l_locations[locationName].count += 1
                }
                l_editSelection[item.id] = false;
            }
        });
        setEditSelection(l_editSelection);
        stats.tags = Object.entries(l_tags).map(entry => {
            return {
                name: entry[0],
                count: entry[1].count
            }
        });
        stats.tags.sort((a,b) => b.count-a.count);
        stats.locations = Object.entries(l_locations).map(entry => {
            return {
                name: entry[0],
                count: entry[1].count
            }
        });
        stats.locations.sort((a,b) => b.count-a.count);
        dispatch(setVisibleStats(stats));
    };

    // Load item data
    setLoading(true);
    fetchData()
    .finally(()=> {setLoading(false)});
  }, [token, scrollPosition, isVisible, dispatch]);

  const getActions = () => {

        // Set-up scenario dependent speed dial actions
        let actions = [];
        if (!isMultiEdit) {
            actions.push({ icon: <AddIcon />, name: 'Add new', action: onAddItem, static: true });
            actions.push({ icon: <ModeEditOutlineOutlinedIcon />, name: 'Edit', action: onMultiEdit, static: true });
        }

        else {
            if (itemCategory === 'active') {
                actions.push({ icon: <InventoryIcon sx={{color: "#a10666"}}/>, name: 'Archive', action: onClearAll, static: false });
            }
            else {
                actions.push({
                    icon: <UnarchiveIcon sx={{color: "#1f750f"}}/>,
                    name: 'Restore',
                    action: onRestoreSelection,
                    static: false
                });
                actions.push({
                        icon: <DeleteIcon sx={{color: "#b52902"}}/>,
                        name: 'Delete',
                        action: onDeleteSelection,
                        static: false
                });
            }

            actions.push({ icon: <RemoveDoneIcon />, name: 'Clear all', action: onClearAll, static: true });
            actions.push({ icon: <DoneAllIcon />, name: 'Select all', action: onSelectAll, static: true });
            actions.push({ icon: <LaunchIcon />, name: 'Move', action: onMoveOpen, static: false });
            actions.push({ icon: <LocalOfferIcon />, name: 'Tag', action: onTagOpen, static: false });

        };

        return actions;
  };

  return(
    <React.Fragment>

     {/*------------------------------------------ Loading ------- */}
     <Backdrop
        sx={{ color: '#2c5585', backgroundColor: 'rgba(0, 0, 0, 0.1);', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
     >
        <CircularProgress color="inherit" thickness={8} />
     </Backdrop>

    {/*------------------------------------------- List of items ----------*/}
    <List sx={{ width: '100%' }}>
        {items.map(item => isVisible(item) &&
          <React.Fragment key={item.id}>
          <Stack direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={0}>
          {(isMultiEdit) &&
            <Checkbox
            checked={editSelection[item.id] || false}
            onChange={onSelectionChange(item.id)}
            sx={{ marginTop: 2}}/>
          }
          <ListItem disablePadding>
            <ListItemButton role={undefined} onClick={handleSelectItem(item)}
                    alignItems="flex-start"
                    selected={item.id === currentItem.id}
                    dense>

             <div>
                <img style={{borderRadius: '1rem',
                    marginRight: '1rem',
                    width: '5rem',
                    height: '5rem',
                    objectFit: 'cover'}}
                  src={getThumbnail(item)}
                  alt={item.name}
                />
                {(itemCategory === 'archived') && (
                    <Fab aria-label="arhived"
                        size='small'
                        sx={{ position: 'absolute', left: '0px', top: '0px', opacity: 0.8}}>
                        <InventoryIcon/>
                    </Fab>
                )}
            </div>

            <Stack direction="column" justifyContent="center" alignItems="flex-start" spacing={0}>
               {/*---------------- Description -----------*/}
               <ListItemText
                  primary={
                    <React.Fragment>
                      <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary">
                        {item.name}
                      </Typography>
                    </React.Fragment>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography sx={{ display: 'inline' }} component="span" variant="body2" color="text.primary">
                        {item.description?.slice(0,isMultiEdit?48:64)}<br/>
                      </Typography>
                    </React.Fragment>
                  }
               />
               {/*---------------- Locations --------------*/}
               <Stack direction="row" spacing={1}>
                    {item.locations.map(location =>
                        <Chip key={item.id+location.name} label={location.name} size="small"/>
                    )}
               </Stack>
            </Stack>

          </ListItemButton>
          </ListItem>
          </Stack>
          <Divider variant="inset" component="li" />
          </React.Fragment>
        )}
    </List>


    {/*------------------------------------------- Actions ---------------*/}
    <SpeedDial
            open={isMenuOpen} onOpen={onMenuOpen} onClose={onMenuClose}
            ariaLabel="SpeedDial basic example"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            icon={<MoreVertIcon />} >
            {getActions().map((action) => (
              (action.static || isItemsSelected()) && (
                  <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={action.action}
                  />
              )
            ))}
     </SpeedDial>

    {/*------------------------------------------- Move ---------------*/}
    <Dialog open={isMoveOpen} onClose={onMoveClose}>
        <DialogTitle>Move selected items</DialogTitle>
        <form onSubmit={onMoveExecute} disabled={isSaving}>
        </form>
    </Dialog>

    {/*------------------------------------------- Tag ---------------*/}
    <Dialog open={isTagOpen} onClose={onTagClose} >
        <DialogTitle>Tag selected items</DialogTitle>
        <form onSubmit={onTagExecute} disabled={isSaving}>
            <Stack direction="column" justifyContent="center" alignItems="center" spacing={2} sx={{margin: 1.5}}>
            <Autocomplete name="tags"
                multiple fullWidth freeSolo disableClearable
                options={globalTags}
                getOptionLabel={(option) => option.name}
                value={tags || []}
                onChange={(event, newValue) => {
                    setTags(newValue);
                }}
                inputValue = {inputTag}
                onInputChange={(event, newValue) => {
                    let candidateValue = newValue.trim();
                    if (newValue !== candidateValue) {
                        candidateValue = candidateValue.toLowerCase();
                        if ((candidateValue !== '') && (!checkTag(candidateValue, tags))) {
                            const selectedTags = tags.concat({name: candidateValue});
                            setTags(selectedTags);
                        }
                        setInputTag('');
                    } else {
                        setInputTag(newValue);
                    }
                }}
                isOptionEqualToValue={(option,value) => {
                    return option.name === value.name;
                }}
                renderInput={(params) => (
                  <TextField {...params} variant="filled" label="Tags"/>
                )}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            color={checkTag(option.name, globalTags) ? 'info' : 'warning'}
                            variant="filled"
                            label={option.name}
                            {...getTagProps({ index })}
                        />
                    ))
                }

            />
            <Button variant="outlined" type="submit">Tag</Button>
            </Stack>
        </form>
     </Dialog>


    </React.Fragment>
  );
}