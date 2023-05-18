import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'
import { useNavigation, useNavigate, useParams } from "react-router-dom";

import {loadItem, archiveItem, loadItemImage} from '../services/backend';

import Box from '@mui/material/Box';
import Carousel from 'react-material-ui-carousel';
import Chip from '@mui/material/Chip';
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import Modal from '@mui/material/Modal';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PushPinIcon from '@mui/icons-material/PushPin';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import ZoomInIcon from '@mui/icons-material/ZoomIn';

import GlobalLoading from '../components/GlobalLoading';


export default function ItemView() {

  const IMAGE_HEIGHT = 240;

  const [item, setItem] = useState({});
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [selectedImage, setSelectedImage] = React.useState('');
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
        // Load images
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
      { icon: <DeleteIcon sx={{color: "#a10666"}}/>, name: 'Delete', action: handleDelete},
   ];

   const handleOpenZoom = (index) => async () => {
        setSelectedImageIndex(index);
        setSelectedImage(await  loadItemImage({token, id, image: item.photos.sources[index] + '.full'}));
        setOpen(true);
   }

   const handleCloseZoom = () => {
        setOpen(false);
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
             <Carousel sx={{width: '100%', border: 1, borderColor: '#cccccc', alignItems: 'center'}}
                    height={IMAGE_HEIGHT}
                    autoPlay={false} animation='slide'
                    navButtonsAlwaysInvisible={true}>
                {
                    images.map( (image, i) => {
                        return (

                        <Box key={i} sx={{
                            width: '100%',
                            height: IMAGE_HEIGHT,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'column'}}>

                            <img  alt={`${item.name} ${i}`} src={image} style={{width: '100%', height: IMAGE_HEIGHT, objectFit: 'cover'}}/>

                            <Fab aria-label="zoom photo"
                                    onClick={handleOpenZoom(i)}
                                    size='small'
                                    sx={{ position: 'absolute', left: '10px', top: '10px', opacity: 0.6}}>
                                    <ZoomInIcon />
                            </Fab>

                            {(item.photos.selected === i) &&
                                <Fab aria-label="photo used as thumbnail"
                                    size='small'
                                    sx={{ position: 'absolute', right: '10px', top: '10px', opacity: 0.6}}>
                                    <PushPinIcon />
                                </Fab>
                            }
                        </Box>
                        )
                    })
                }
             </Carousel>
          </React.Fragment>
       )}

       {/*-------------------------------------- Zoomed photo -------*/}
       <Modal
            open={open}
            onClose={handleCloseZoom}
            aria-labelledby="modal-add-photo"
            aria-describedby="modal-take-product-photo">
            <Box sx={{position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  height: '100%',
                  width: '100%',
                  bgcolor: 'black',
                  padding: '2px',
                  border: 0}}>

                  <TransformWrapper
                    centerOnInit={true}
                    disablePadding={true}
                  >
                      <TransformComponent  wrapperStyle={{
                          width: "100%",
                          height: "100%"
                        }}>
                        <img alt={`${item.name} zoom ${selectedImageIndex}`} src={selectedImage} style={{width: '100%', objectFit: 'cover'}}/>
                      </TransformComponent>
                  </TransformWrapper>

                  <Fab aria-label="photo used as thumbnail"
                    size='small'
                    onClick={handleCloseZoom}
                    sx={{ position: 'absolute', right: '10px', top: '10px', opacity: 0.8}}>
                    <CloseIcon />
                  </Fab>

            </Box>
       </Modal>
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