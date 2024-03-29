import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'
import { useNavigation, useNavigate, useParams } from "react-router-dom";

import {loadItem, archiveItem, deleteItem, loadItemImage} from '../services/backend';
import { filter2search} from '../services/utils';

import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Carousel from 'react-material-ui-carousel';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import Modal from '@mui/material/Modal';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PushPinIcon from '@mui/icons-material/PushPin';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import UnarchiveIcon from '@mui/icons-material/Unarchive';

import GlobalLoading from '../components/GlobalLoading';

export default function ItemView() {

    const IMAGE_HEIGHT = 240;

    const [item, setItem] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [images, setImages] = useState([]);
    const [open, setOpen] = React.useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
    const [selectedImage, setSelectedImage] = React.useState('');

    const token = useSelector((state) => state.global.token);
    const itemCategory = useSelector((state) => state.global.itemCategory);
    const searchFilter = useSelector((state) => state.global.searchFilter);

    const { id } = useParams();

    const navigation = useNavigation();
    const navigate = useNavigate();

    if (error) {
        throw error;
    };

    const onEdit = () => {
        navigate('edit');
    };

    useEffect(() => {
    async function fetchData() {
        const l_item  = await loadItem({id});
        setItem(l_item);
        // Load images
        if (l_item.photos?.sources[0]) {
            let l_images=[];
            for(let i=0; i<l_item.photos.sources.length; i++) {
                l_images.push(await  loadItemImage({id, image: l_item.photos.sources[i]}));
            }
            setImages(l_images);
        }
    };
    setLoading(true);
    fetchData()
    .catch((error) => {setError(error)})
    .finally(()=> {setLoading(false)});
  }, [token, id]);

    const onArchive = async() => {
        await archiveItem({id, active: false});
        navigate(-1);
    };
   
    const onRestore = async() => {
        await archiveItem({id, active: true});
        navigate(-1);
    };

    const onDelete = async() => {
        await deleteItem({id});
        navigate(-1);
    };

    const onOpenZoom = (index) => async () => {
        setSelectedImageIndex(index);
        const image = await loadItemImage({id, image: item.photos.sources[index] + '.full'});
        setSelectedImage(image);
        setOpen(true);
    };

    const onCloseZoom = () => {
        setOpen(false);
    };

    const onTag = (tagName) => () => {
        let searchText = filter2search(searchFilter);
        if (searchText !== '') {
            searchText = `${searchText},`;
        }
        navigate({
            pathname: '/',
            search: `?search=${searchText} t.${tagName}`,
        })
    };

    const onLocation = (locationName) => () => {
        let searchText = filter2search(searchFilter);
        if (searchText !== '') {
            searchText = `${searchText},`;
        }
        navigate({
            pathname: '/',
            search: `?search=${searchText} l.${locationName}`,
        })
    };

    // Set-up scenario dependent speed dial actions
    let actions = [
        { icon: <ModeEditOutlineOutlinedIcon />, name: 'Edit', action: onEdit }
    ];
    if ((itemCategory === 'active') && (item.is_active)) {
        actions.push({
            icon: <InventoryIcon sx={{color: "#a10666"}}/>,
            name: 'Archive',
            action: onArchive
        });
    }
    else if ((itemCategory === 'archived') && (!item.is_active)) {
        actions.push({
            icon: <UnarchiveIcon sx={{color: "#1f750f"}}/>,
            name: 'Restore',
            action: onRestore
        });
    actions.push({
            icon: <DeleteIcon sx={{color: "#b52902"}}/>,
            name: 'Delete',
            action: onDelete
        });
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

       {/*------------------------------------------ Loading ------- */}
          <Backdrop
            sx={{ color: '#1d6fcf', backgroundColor: 'rgba(0, 0, 0, 0.1);', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <CircularProgress color="inherit" thickness={8} />
          </Backdrop>
       {/*--------------------------------------------- Name ------- */}
       <Stack direction="row" justifyContent="center" alignItems="center">

           {(!item.is_active) && (
                    <InventoryIcon sx={{ marginRight: '10px',  opacity: 0.3}}/>
            )}

           <Typography sx={{ display: 'inline' }} component="span" variant="h4" color="text.primary">
               {item.name}
           </Typography>
       </Stack>

       {/*--------------------------------------------- Tags ------- */}
       <Stack direction="row" spacing={1}>
            {item.tags?.map(tag =>
                <Chip key={item.id+ '_t_' + tag.name} label={tag.name}  onClick={onTag(tag.name)}  color="primary"/>
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
                                    onClick={onOpenZoom(i)}
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
            onClose={onCloseZoom}
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
                    onClick={onCloseZoom}
                    sx={{ position: 'absolute', right: '10px', top: '10px', opacity: 0.8}}>
                    <CloseIcon />
                  </Fab>

            </Box>
       </Modal>
       {/*-------------------------------------- Description ------- */}
       {item.description?.split('\n').map((line,index)=>
            <Typography key={index} sx={{ display: 'inline', marginTop: 0, paddingLeft: '5px' }} component="span" variant="body1" color="text.primary" align="justify">
                {line}
            </Typography>
       )}
       {/*-------------------------------------- Locations  -------- */}
       <Typography sx={{ display: 'inline' }} component="span" variant="h6" color="text.primary" align="justify">
           Location
       </Typography>
       <Stack direction="row" spacing={1}>
            {item.locations?.map(location =>
                <Chip key={item.id+'_l_' + location.name} label={location.name} onClick={onLocation(location.name)} color="success"/>
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
                   {item.cost} EUR
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
       {/*---------------------------------------- Actions -----------*/}
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