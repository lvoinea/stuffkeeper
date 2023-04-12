import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from "react-router-dom";

import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import AddIcon from '@mui/icons-material/Add';

import {getItems} from '../services/backend';
import {setSelectedItem, setYItems} from '../services/store';


export default function Items() {

  const [items, setItems] = useState([]);

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
    fetchData();
  });

  return(
    <React.Fragment>

    {/*------------------------------------------- List of items ----------*/}
    <List sx={{ width: '100%' }}>
        {items.map(item =>
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
                  src="https://placekitten.com/g/100/100"
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
                        {item.description.slice(0,64)}<br/>
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
    <Fab color="primary" aria-label="add" sx={{ position: 'fixed', right: '20px', bottom: '20px'}}>
        <AddIcon />
    </Fab>
    </React.Fragment>
  );
}