import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from "react-router-dom";

import Backdrop from '@mui/material/Backdrop';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import AddIcon from '@mui/icons-material/Add';

import {getItems, addItem} from '../services/backend';
import {setSelectedItem, setYItems} from '../services/store';


export default function Items() {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = useSelector((state) => state.global.token);
  const scrollPosition = useSelector((state) => state.global.itemsY);
  const currentItem = useSelector((state) => state.global.selectedItem);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSelectItem = (item) => () => {
    dispatch(setSelectedItem({name: item.name, id: item.id}));
    dispatch(setYItems(window.pageYOffset));
    navigate(`/items/${item.id}`);
  };

  useEffect(() => {
    async function fetchData() {
        const items = await getItems({token});
        setItems(items);
        setTimeout(() => {
            window.scrollTo(0, scrollPosition);
        });
    };
    setLoading(true);
    fetchData()
    .finally(()=> {setLoading(false)});
  }, [token, scrollPosition]);

  const getThumbnail = (item) => {
    if (item.photos?.thumbnail) {
        return 'data:image/jpeg;base64,' + item.photos.thumbnail;
    } else {
        // If the thumbnail is not avaiable replace it with a standard image
        return 'no-image-icon.gif';
    }
  }

  const onAddItem = async () => {
    const newItem = {
      "name": "New Item",
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

  return(
    <React.Fragment>

     {/*------------------------------------------ Loading ------- */}
     <Backdrop
        sx={{ color: '#2c5585', backgroundColor: 'rgba(0, 0, 0, 0.1);', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
     >
        <CircularProgress color="inherit" />
     </Backdrop>

    {/*------------------------------------------- List of items ----------*/}
    <List sx={{ width: '100%' }}>
        {items.map(item => item.is_active &&
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