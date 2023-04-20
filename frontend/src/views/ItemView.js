import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux'
import { useNavigation, useNavigate, useParams } from "react-router-dom";

import {loadItem, archiveItem, loadItemImage, getItemImage} from '../services/backend';

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
  const [images, setImages] = useState([]);
  const token = useSelector((state) => state.global.token);
  const { id } = useParams();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const imageRef = useRef(null);

  if (error) {
    throw error;
  }

  const handleEdit = () => {
    navigate('edit');
  };

  useEffect(() => {
    async function fetchData() {
        const l_item  = await loadItem({token, id});
        setItem(l_item);
        if (l_item.photos?.sources[0]) {
            const l_image = await  getItemImage({token, id, image: l_item.photos?.sources[0]});
            setImages([l_image])
        }
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

   const setImageRef = element => {
      if ((imageRef.current == null) && (item.photos?.sources)) {
        imageRef.current = element;
        //loadItemImage({token, id, image: item.photos?.sources[0], target: element })
      }
    };

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

       {/*------------------------------------------- Images ------- */}
       {(item.photos?.sources[0]) && (
          <React.Fragment>
            <img ref={setImageRef} alt={item.name} src={images[0]?images[0]:''}/>
       </React.Fragment>
       )}

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
       {(item.code) && (
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
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
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