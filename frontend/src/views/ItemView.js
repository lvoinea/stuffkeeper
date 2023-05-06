import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'
import { useNavigation, useNavigate, useParams } from "react-router-dom";

import {loadItem, archiveItem, loadItemImage} from '../services/backend';

import Carousel from 'react-material-ui-carousel'
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
            let l_images=[];
            for(let i=0; i<l_item.photos.sources.length; i++) {
                l_images.push(await  loadItemImage({token, id, image: l_item.photos.sources[i]}));
            }
            setImages(l_images);
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
             <Carousel sx={{width: '100%', border: 1, borderColor: '#cccccc', alignItems: 'center'}} height={240}>
                {
                    images.map( (image, i) => {
                        return (
                            <img key={i} alt={`${item.name} ${i}`} src={image} style={{width: '100%', height: 240, objectFit: 'cover'}}/>
                        )
                    })
                }
             </Carousel>
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
          {/*-------------------------------------- Cost  --------- */}
          {(item.cost !== 0) && (
          <React.Fragment>
          <Grid xs={4} item={true}>
               <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary" align="justify">
                   Cost
               </Typography>
          </Grid>
          <Grid xs={8} item={true}>
               <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary">
                   {item.cost}
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