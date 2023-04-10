import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'
import { useNavigation, useNavigate, useParams } from "react-router-dom";

import {loadItem, archiveItem} from '../services/backend';

import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

import GlobalLoading from '../components/GlobalLoading';


export default function ItemView() {

  const [item, setItem] = useState({});
  const [error, setError] = useState(null);
  const token = useSelector((state) => state.global.token);
  const { id } = useParams();
  const navigation = useNavigation();
  const navigate = useNavigate();

  if (error) {
    throw error;
  }

  const handleEdit = () => {
    navigate('edit');
  };

  useEffect(() => {
    async function fetchData() {
        setItem(await loadItem({token, id}));
    };
    fetchData().catch((error) => {setError(error)});
  }, [token, id]);

   const handleDelete = async() => {
     await archiveItem({token, id});
     navigate(-1);
   }

   const actions = [
      { icon: <ModeEditOutlineOutlinedIcon />, name: 'Edit', action: handleEdit },
      { icon: <RemoveCircleIcon sx={{color: 'red'}} />, name: 'Delete', action: handleDelete},
   ];

  return(
  <React.Fragment>

    <GlobalLoading />

    <Stack direction="column"
            justifyContent="center"
            alignItems="flex-start"
            spacing={1}
            sx={{
                padding: '15px',
                opacity: (navigation.state === "loading") ? '0.25': '1.0',
                transition: 'opacity 200ms',
                transitionDelay: '200ms'
             }}>
       {/*--------------------------------------------- Name ------- */}
       <Typography sx={{ display: 'inline' }} component="span" variant="h4" color="text.primary">
           {item.name}
       </Typography>

       {/*--------------------------------------------- Tags ------- */}
       <Stack direction="row" spacing={1}>
            {item.tags?.map(tag =>
                <Chip key={item.id+ '_t_' + tag.name} label={tag.name} variant="outlined"/>
            )}
       </Stack>

       {/*-------------------------------------- Description ------- */}
       <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
           {item.description}
       </Typography>

       {/*-------------------------------------- Locations  -------- */}
       <Typography sx={{ display: 'inline' }} component="span" variant="h6" color="text.primary" align="justify">
           Location
       </Typography>
       <Stack direction="row" spacing={1}>
            {item.locations?.map(location =>
                <Chip key={item.id+'_l_' + location.name} label={location.name} variant="outlined"/>
            )}
       </Stack>

       <Typography sx={{ display: 'inline' }} component="span" variant="h6" color="text.primary" align="justify">
           Details
       </Typography>
       <Grid container spacing={0} sx={{paddingLeft: '10px'}}>
          {/*-------------------------------------- Quantity  --------- */}
          {(item.quantity !== 1) && (
          <React.Fragment>
          <Grid xs={4} item={true}>
               <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                   Quantity
               </Typography>
          </Grid>
          <Grid xs={8} item={true}>
               <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary">
                   {item.quantity}
               </Typography>
          </Grid>
          </React.Fragment>
          )}

          {/*-------------------------------------- Expiration  ------- */}
          {(item.expiration_date) && (
          <React.Fragment>
          <Grid xs={4} item={true}>
            <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                Expiration
            </Typography>
          </Grid>
          <Grid xs={8} item={true}>
            <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary">
               {item.expiration_date}
            </Typography>
          </Grid>
          </React.Fragment>
          )}

       {/*-------------------------------------- Code  ------------- */}
       {(item.code !== "") && (
           <React.Fragment>
           <Grid xs={4} item={true}>
           <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
               Code
           </Typography>
           </Grid>
           <Grid xs={8} item={true}>
           <Typography sx={{ display: 'inline'}} component="span" variant="body1" color="text.primary">
                {item.code}
           </Typography>
           </Grid>
           </React.Fragment>
       )}
       </Grid>

       <SpeedDial
            ariaLabel="SpeedDial basic example"
            sx={{ position: 'absolute', bottom: 16, right: 16 }}
            icon={<MoreVertIcon />} >
            {actions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                onClick={action.action}
              />
            ))}
      </SpeedDial>

    </Stack>

   </React.Fragment>
  );
}