import React, {useEffect, useState, useCallback} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";

import Backdrop from '@mui/material/Backdrop';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Fab from '@mui/material/Fab';
import InventoryIcon from '@mui/icons-material/Inventory';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import AddIcon from '@mui/icons-material/Add';

import {getItems, addItem } from '../services/backend';
import {setSelectedItem, setYItems, setVisibleStats} from '../services/store';


export default function Items() {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = useSelector((state) => state.global.token);
  const scrollPosition = useSelector((state) => state.global.itemsY);
  const itemCategory = useSelector((state) => state.global.itemCategory);
  const currentItem = useSelector((state) => state.global.selectedItem);
  const searchFilter = useSelector((state) => state.global.searchFilter);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSelectItem = (item) => () => {
    dispatch(setSelectedItem({name: item.name, id: item.id}));
    dispatch(setYItems(window.pageYOffset));
    navigate(`/items/${item.id}`);
  };

  const getThumbnail = (item) => {
    if (item.photos?.thumbnail) {
        return 'data:image/jpeg;base64,' + item.photos.thumbnail;
    } else {
        // If the thumbnail is not available replace it with a standard image
        return 'no-image-icon.gif';
    }
  }

  const onAddItem = async () => {
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

  useEffect(() => {
    async function fetchData() {
        const items = await getItems({token});
        setItems(items);
        setTimeout(() => {
            window.scrollTo(0, scrollPosition);
        });
        let stats = {count: 0, cost: 0}
        items.forEach(item => {
            if (isVisible(item)) {
                stats.count += 1;
                stats.cost += item.cost;
            }
        });
        dispatch(setVisibleStats(stats));
    };
    setLoading(true);
    fetchData()
    .finally(()=> {setLoading(false)});
  }, [token, scrollPosition, isVisible]);

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
                        {item.description?.slice(0,64)}<br/>
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
          <Divider variant="inset" component="li" />
          </React.Fragment>
        )}
    </List>
    {/*------------------------------------------- Add Item ---------------*/}
    <Fab color="primary" aria-label="add"
        onClick={onAddItem}
        sx={{ position: 'fixed', right: '20px', bottom: '20px'}}>
            <AddIcon />
    </Fab>
    </React.Fragment>
  );
}