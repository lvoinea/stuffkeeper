import React, {useEffect, useState, useCallback} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";

import Autocomplete from '@mui/material/Autocomplete';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
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

import {getItems, addItem, saveItem, archiveItem, deleteItem, checkTag, checkLocation } from '../services/backend';
import {setSelectedItem, setYItems, setVisibleStats, setIsMultiEdit,
 setTags as setGlobalTags, setLocations as setGlobalLocations} from '../services/store';


export default function Items() {

  const [items, setItems] = useState([]);
  const [isBusy, setIsBusy] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editSelection, setEditSelection] = useState({});
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isTagOpen, setIsTagOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
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

  const computeVisibleStats = useCallback((p_items) => {
    let stats = {count: 0, cost: 0, tags: 0, locations: 0}
    let l_tags = {}
    let l_locations = {}
    p_items.forEach(item => {
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
        }
    });
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
  }, [isVisible, dispatch]);

  const resetSelection = useCallback((p_items) => {
    let l_editSelection = {}
    p_items.forEach(item => {
        if (isVisible(item)) {
            l_editSelection[item.id] = false;
        }
    });
    setEditSelection(l_editSelection);
  },[isVisible]);

  //--- Selecting
  
  const isItemsSelected = useCallback(() => {
    return Object.values(editSelection).some(item => item);
  }, [editSelection]);

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

  const onSelectItem = (item) => () => {
    if (isMultiEdit) {
        onSelectionChange(item.id)();
    }
    else {
        dispatch(setSelectedItem({name: item.name, id: item.id}));
        dispatch(setYItems(window.pageYOffset));
        navigate(`/items/${item.id}`);
    };
  };
  
  //--- Creating
  
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
  
  //--- Tagging

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
  
  const onTagExecute = useCallback(async (event) => {
    event.preventDefault();

    let tagsBefore = getCommonTags().map(tag=> tag.name);
    let tagsAfter = tags.map(tag => tag.name);
    let tagsDeleted = tagsBefore.filter(tag => !tagsAfter.includes(tag));
    let tagsAdded = tagsAfter.filter(tag => !tagsBefore.includes(tag));

    let needsSaving = (tagsAdded.length > 0) || (tagsDeleted.length > 0) ;
    if (needsSaving){
        setIsDisabled(true);
        setIsBusy(true);
        items.forEach(async (item) => {
            if (editSelection[item.id]) {
                let tagsExisting = item.tags.map(tag => tag.name);
                let tagsItem = tagsExisting.filter( tag => !tagsDeleted.includes(tag));
                let tagsNew = tagsAdded.filter( tag => !tagsExisting.includes(tag));
                tagsItem.push(...tagsNew);

                let updatedItem = {
                    tags: tagsItem.map(tag => {
                        return {name: tag}
                    })
                };

                // Save the item itself
                await saveItem({token, item: updatedItem, id: item.id});
                // Update cached tags if new ones are added
                const newGlobalTags = updatedItem.tags?.filter(tag => !checkTag(tag.name, globalTags));
                if (newGlobalTags) {
                    dispatch(setGlobalTags(globalTags.concat(newGlobalTags)));
                }
            }
        });
        setIsBusy(false);
        setIsDisabled(false);
    };
    setTags([]);
    setIsTagOpen(false);
  }, [token, items, tags, getCommonTags, globalTags, editSelection, dispatch]);

  //--- Moving

  const getCommonLocations = useCallback(() => {

    // Get locations from the selected items
    let selectedCount = 0;
    let l_locations = {}
    items.forEach(item => {
        if (editSelection[item.id]) {
            selectedCount += 1;
            for(let i=0; i<item.locations.length; i++){
                let locationName = item.locations[i].name
                l_locations[locationName] = l_locations[locationName] || 0;
                l_locations[locationName] += 1;
            }
        }
    });

    // Extract locations that occur in all selected items
    let commonLocations=[];
    Object.entries(l_locations).forEach(location => {
        if (location[1] === selectedCount) {
            commonLocations.push({
                name: location[0]
            });
        }
    });

    return commonLocations;
  },[items, editSelection]);

  const onMoveOpen = useCallback(() => {
     setIsMenuOpen(false);
     let commonLocations = getCommonLocations();
     setLocations(commonLocations);
     setIsMoveOpen(true);
  }, [getCommonLocations]);

  const onMoveClose = () => {
    setIsMoveOpen(false);
  };

  const onMoveExecute = useCallback(async (event) => {
    event.preventDefault();

    let locationsBefore = getCommonLocations().map(location=> location.name);
    let locationsAfter = locations.map(location => location.name);
    let locationsDeleted = locationsBefore.filter(location => !locationsAfter.includes(location));
    let locationsAdded = locationsAfter.filter(location => !locationsBefore.includes(location));

    let needsSaving = (locationsAdded.length > 0) || (locationsDeleted.length > 0) ;
    if (needsSaving){
        setIsDisabled(true);
        setIsBusy(true);
        items.forEach(async (item) => {
            if (editSelection[item.id]) {
                let locationsExisting = item.locations.map(location => location.name);
                let locationsItem = locationsExisting.filter( location => !locationsDeleted.includes(location));
                let locationsNew = locationsAdded.filter( location => !locationsExisting.includes(location));
                locationsItem.push(...locationsNew);

                let updatedItem = {
                    locations: locationsItem.map(location => {
                        return {name: location}
                    })
                };

                // Save the item itself
                await saveItem({token, item: updatedItem, id: item.id});
                // Update cached locations if new ones are added
                const newGlobalLocations = updatedItem.locations?.filter(location => !checkLocation(location.name, globalLocations));
                if (newGlobalLocations) {
                    dispatch(setGlobalLocations(globalLocations.concat(newGlobalLocations)));
                }
            }
        });
        setIsBusy(false);
        setIsDisabled(false);
    };
    setTags([]);
    setIsMoveOpen(false);
  }, [token, items, locations, getCommonLocations, globalLocations,editSelection, dispatch]);

  //--- Other

  const onMultiEdit = useCallback(async () => {
    dispatch(setIsMultiEdit(true));
    setIsMenuOpen(false);
  }, [dispatch]);

  const  onArchiveSelection = useCallback(async() => {
    setIsBusy(true);
    let l_items = []
    items.forEach(async (item) => {
        if (isVisible(item) && editSelection[item.id]) {
            await archiveItem({token, id: item.id, active: false});
            l_items.push({...item, active:false});
        }
        else {
            l_items.push(item);
        }
    });
    setItems(l_items);
    resetSelection(l_items);
    computeVisibleStats(l_items);
    setIsBusy(false);
    setIsMenuOpen(false);
  }, [token, items, editSelection, isVisible, computeVisibleStats, resetSelection]);

  const onRestoreSelection = useCallback(async() => {
    setIsBusy(true);
    let l_items = []
    items.forEach(async (item) => {
        if (isVisible(item) && editSelection[item.id]) {
            await archiveItem({token, id: item.id, active: true});
            l_items.push({...item, active:true});
        }
        else {
            l_items.push(item);
        }
    });
    setItems(l_items);
    resetSelection(l_items);
    computeVisibleStats(l_items);
    setIsBusy(false);
    setIsMenuOpen(false);
  }, [token, items, editSelection, isVisible, computeVisibleStats, resetSelection]);

  const onDeleteSelection = () => {
    setIsBusy(true);
    let l_items = []
    items.forEach(async (item) => {
        if (isVisible(item) && editSelection[item.id]) {
            await deleteItem({token, id: item.id});
        }
        else {
            l_items.push(item);
        }
    });
    setItems(l_items);
    resetSelection(l_items);
    computeVisibleStats(l_items);
    setIsBusy(false);
    setIsMenuOpen(false);
  };

  //--- Action Menu

  const onActionMenuOpen = (event) => {
    if (event.type === 'click'){
        setIsMenuOpen(true);
    }
  };

  const onActionMenuClose = () => {
    setIsMenuOpen(false);
  };

  const getActions = () => {

        // Set-up scenario dependent speed dial actions
        let actions = [];
        if (!isMultiEdit) {
            actions.push({ icon: <AddIcon />, name: 'Add new', action: onAddItem, static: true });
            actions.push({ icon: <ModeEditOutlineOutlinedIcon />, name: 'Edit', action: onMultiEdit, static: true });
        }

        else {
            if (itemCategory === 'active') {
                actions.push({ icon: <InventoryIcon sx={{color: "#a10666"}}/>, name: 'Archive', action: onArchiveSelection, static: false });
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

  //--- Set-up

  useEffect(() => {
    async function fetchData() {
        const l_items = await getItems();
        setItems(l_items);
        setTimeout(() => {
            window.scrollTo(0, scrollPosition);
        });
        resetSelection(l_items);
        computeVisibleStats(l_items);
    };

    // Load item data
    setIsBusy(true);
    fetchData()
    .finally(()=> {setIsBusy(false)});
  }, [token, scrollPosition, resetSelection, computeVisibleStats]);

  return(
    <React.Fragment>

     {/*------------------------------------------ Loading ------- */}
     <Backdrop
        sx={{ color: '#2c5585', backgroundColor: 'rgba(0, 0, 0, 0.1);', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isBusy}
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
            <ListItemButton role={undefined} onClick={onSelectItem(item)}
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
               <Box>
                    {item.locations.map(location =>
                        <Chip key={item.id+location.name} label={location.name} size="small" sx={{marginTop: 0.5, marginRight: 1}}/>
                    )}
               </Box>
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
            open={isMenuOpen} onOpen={onActionMenuOpen} onClose={onActionMenuClose}
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

    {/*------------------------------------------- Tag ---------------*/}
    <Dialog open={isTagOpen} onClose={onTagClose} >
        <DialogTitle>Tag selected items</DialogTitle>
        <form onSubmit={onTagExecute} disabled={isDisabled}>
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
            <Button variant="text" type="submit">Tag</Button>
            </Stack>
        </form>
    </Dialog>

    {/*------------------------------------------- Move ---------------*/}
    <Dialog open={isMoveOpen} onClose={onMoveClose} >
        <DialogTitle>Move selected items</DialogTitle>
        <form onSubmit={onMoveExecute} disabled={isDisabled}>
            <Stack direction="column" justifyContent="center" alignItems="center" spacing={2} sx={{margin: 1.5}}>
            <Autocomplete name="locations"
                multiple fullWidth freeSolo disableClearable
                options={globalLocations}
                getOptionLabel={(option) => option.name}
                value={locations || []}
                onChange={(event, newValue) => {
                    setLocations(newValue);
                }}
                inputValue = {inputLocation}
                onInputChange={(event, newValue) => {
                    let candidateValue = newValue.trim();
                    if (newValue !== candidateValue) {
                        candidateValue = candidateValue.toLowerCase();
                        if ((candidateValue !== '') && (!checkLocation(candidateValue, locations))) {
                            const selectedLocations = locations.concat({name: candidateValue});
                            setLocations(selectedLocations);
                        }
                        setInputLocation('');
                    } else {
                        setInputLocation(newValue);
                    }
                }}
                isOptionEqualToValue={(option,value) => {
                    return option.name === value.name;
                }}
                renderInput={(params) => (
                  <TextField {...params} variant="filled" label="Locations"/>
                )}
                renderTags={(value, getLocationProps) =>
                    value.map((option, index) => (
                        <Chip
                            color={checkLocation(option.name, globalLocations) ? 'info' : 'warning'}
                            variant="filled"
                            label={option.name}
                            {...getLocationProps({ index })}
                        />
                    ))
                }

            />
            <Button variant="text" type="submit">Move</Button>
            </Stack>
        </form>
      </Dialog>

    </React.Fragment>
  );
}