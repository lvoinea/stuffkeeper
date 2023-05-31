import React, {useEffect, useReducer, useState, useRef} from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useNavigation, useNavigate, useParams } from "react-router-dom";

import _ from 'lodash';
import dayjs from 'dayjs'

import { loadItem, saveItem, checkTag, checkLocation, loadItemImage, saveItemImage } from '../services/backend';
import {setTags, setLocations} from '../services/store';
import {blobToDataUrl} from '../services/utils';

import { Cropper } from "react-cropper";
import "cropperjs/dist/cropper.css";

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Carousel from 'react-material-ui-carousel';
import Chip from '@mui/material/Chip';
import { DateField } from '@mui/x-date-pickers/DateField';
import Fab from '@mui/material/Fab';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Modal from '@mui/material/Modal';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import HdIcon from '@mui/icons-material/Hd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PushPinIcon from '@mui/icons-material/PushPin';
import SaveIcon from '@mui/icons-material/Save';
import SdIcon from '@mui/icons-material/Sd';

const formReducer = (state, action) => {
  return {
   ...state,
   [action.field]: action.value
  }
}

const createImage = async (src) => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  })
}

const canvasToBlob = async (canvas) => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      "image/jpeg",
      0.95
    );
  })
}

const makeThumbnail = async (size, imageUrl) => {
    const image = await createImage(imageUrl);
    // Extract the centerpiece
    const offsetX = (image.width > image.height) ? (image.width - image.height) /2 : 0;
    const offsetY = (image.width < image.height) ? (image.height - image.width) /2 : 0;
    let canvas = new OffscreenCanvas(size, size);
    let ctx = canvas.getContext("2d");
    ctx.drawImage(
        image,
        offsetX, offsetY, image.width - 2*offsetX, image.height - 2 * offsetY,
        0, 0, size, size
    );
    const imageBlob = await canvas.convertToBlob({type: "image/jpeg", quality: 1});
    const dataUrl = await blobToDataUrl(imageBlob);
    return dataUrl.replace(/^data:image\/?[A-z]*;base64,/,'');
}

export default function ItemEditView() {

  const IMAGE_HEIGHT = 240;
  const THUMBNAIL_SIZE = 80;
  const SD_PHOTO = 'sd';
  const HD_PHOTO = 'hd';

  const [item, setItem] = useState({});
  const [open, setOpen] = useState(false);
  const [newPhoto, setNewPhoto] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useReducer(formReducer, {});
  const [formError, setFormError] = useReducer(formReducer, {});
  const [images, setImages] = useState([]);
  const [inputTag, setInputTag] = useState('');
  const [inputLocation, setInputLocation] = useState('');

  const token = useSelector((state) => state.global.token);
  const tags = useSelector((state) => state.global.tags);
  const locations = useSelector((state) => state.global.locations);

  const inputFile = useRef(null);
  const cropperRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  if (error) {
    throw error;
  }

  useEffect(() => {
    async function fetchData() {
        let l_item = await loadItem({token, id})
        setItem(l_item);
        // Pre-fill form fields
        for (let field in l_item){
            // Need to deserialize expiration date
            if (field === 'expiration_date') {
                let value = l_item[field] ? dayjs(l_item[field]) : null;
                setFormData({field, value});
            } else if (field !== 'id') {
                setFormData({field: field, value: l_item[field]});
            }
        }
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    let needsSaving = false;

    // Create a new item that only contains the updated fields
    // in order to reduce the amount of data sent over the line.
    // Otherwise this can become a problem with image data.
    let updatedItem = {}
    for (let field in item){
        let fieldValue = formData[field];
        // Need to serialize the expiration date
        if (field === 'expiration_date') {
            fieldValue = fieldValue?.format('YYYY-MM-DD')
        }
        if (!_.isEqual(item[field], fieldValue)) {
            updatedItem[field] = fieldValue;
            needsSaving = true;
        }
    }
    if (needsSaving){
        setIsSaving(true);

        // Check whether there are new photos to save (i.e., source is SD_PHOTO or HD_PHOTO)
        // and save them. For each saved source, retrieve the id as reported by
        // the backend and use it instead of the new photo marker in the item.
        for (let i=0; i<updatedItem.photos.sources.length; i++){
            const sourceName = updatedItem.photos.sources[i];
            if ((sourceName === SD_PHOTO) || (sourceName === HD_PHOTO)) {
                const photoId = await saveItemImage({token, id, imageUrl: images[i], mode: sourceName});
                updatedItem.photos.sources[i] = photoId.filename;
            }
        }

        // Save the item itself
        await saveItem({token, item: updatedItem, id});
        // Update cached tags if new ones are added
        const newTags = updatedItem.tags?.filter(tag => !checkTag(tag.name, tags));
        if (newTags) {
            dispatch(setTags(tags.concat(newTags)));
        }
        // Update cached tags if new ones are added
        const newLocations = updatedItem.locations?.filter(location => !checkLocation(location.name, locations));
        if (newLocations) {
            dispatch(setLocations(locations.concat(newLocations)));
        }

        setIsSaving(false);
        navigate(-1);
    }
  }

  const handleChange = event => {
    let field;
    let value;
    const isDate = event?.hasOwnProperty('$d');
    const isCheckbox = event?.target?.type === 'checkbox';

    if (isDate || (event == null)) {
        field = 'expiration_date';
        value = event;
    }
    else if (isCheckbox) {
        field = event.target.name;
        value = event.target.checked;
    }
    else {
        field= event.target.name;
        value = event.target.value;
    }
    setFormData({field,value});
  }

  const handleDateError = async(event) => {
    let error = event;
    if (error === 'minDate') {
        error = 'Date is too far in the past';
    } else if (error === 'maxDate') {
        error = 'Date is too far in the future';
    }
    setFormError({field:'expiration_date',value:error});
  }

  const handleSave = async(event) => {
  }

  const checkDisabled = (action) => {
    if (action === 'Save') {
        let disabled = false;
        for (let field in formError){
            if (formError[field] != null) {
                disabled = true;
            }
        }
        return disabled;
    }
  }

  const actions = [
      { icon: <SaveIcon />, name: 'Save', action: handleSave , type: 'submit', disabled: checkDisabled('Save')},
  ];

  const onOpenCamera = () => {
    inputFile.current.click();
  };

  const onTakePhoto = async (event) => {
    event.stopPropagation();
    event.preventDefault();
    const file = event.target.files[0];
    const newImage = URL.createObjectURL(file);
    setNewPhoto(newImage);
    setOpen(true);
  }

  const onPhotoCancel = () => setOpen(false);

  const onSavePhoto = (mode) => async (event) => {
    const cropper = cropperRef.current?.cropper;
    //const newImage = cropper.getCroppedCanvas().toDataURL();
    const newImage = await canvasToBlob(cropper.getCroppedCanvas());
    setImages(images.concat([URL.createObjectURL(newImage)]));

    let newPhotos = {
        'sources': formData.photos.sources.concat([mode])
    }
    if (formData.photos.selected == null) {
        // When no thumbnail has been previously set, create one
        // from the currently added image.
        newPhotos['thumbnail'] = await makeThumbnail(THUMBNAIL_SIZE, newImage);
        newPhotos['selected'] = images.length;
    }
    else {
        newPhotos['thumbnail'] = formData.photos.thumbnail
        newPhotos['selected'] = formData.photos.selected;
    }
    setFormData({field: 'photos', value: newPhotos});
    setOpen(false);
  };

  const onPinPhoto = (index) => async () => {
    const newThumbnail = await makeThumbnail(THUMBNAIL_SIZE, images[index]);
    setFormData({field: 'photos', value: {
        ...formData.photos,
        'thumbnail': newThumbnail,
        'selected': index
      }});
  }

  const onRemovePhoto = (index) => async () => {

      let newImages = images.slice();
      newImages.splice(index,1);
      setImages(newImages);

      let newSources = formData.photos.sources.slice();
      newSources.splice(index,1);

      let newPhotos = {
        'sources': newSources
      }
      if (newImages.length > 0) {
           if (index === formData.photos.selected) {
               // Replace thumbnail with first available image when it
               // is associated with the removed image.
               // When no image is left, remove the thumbnail.
               newPhotos['thumbnail'] = await makeThumbnail(THUMBNAIL_SIZE, newImages[0]);
               newPhotos['selected'] = 0;
           }
           else {
               // If the thumbnail is from another image, keep it
               newPhotos['thumbnail'] = formData.photos.thumbnail
               newPhotos['selected'] = (formData.photos.selected > index) ? formData.photos.selected -1 : formData.photos.selected;
           }
      }
      setFormData({field: 'photos', value: newPhotos});
  }

  return(
  <React.Fragment>
  <form onSubmit={handleSubmit} disabled={isSaving}>
  <Stack direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={2}
            sx={{
                padding: '15px',
                opacity: (navigation.state === "loading") ? '0.25': '1.0',
                transition: 'opacity 200ms',
                transitionDelay: '200ms'
             }}>

        {/*--------------------------------------------- Name ------- */}
        <TextField label="Name" name="name" variant="filled" fullWidth
            value={formData.name || ''} onChange={handleChange} />

        {/*--------------------------------------------- Tags ------- */}
        <Autocomplete name="tags"
            multiple fullWidth freeSolo disableClearable
            options={tags}
            getOptionLabel={(option) => option.name}
            value={formData.tags || []}
            onChange={(event, newValue) => {
                setFormData({field: 'tags', value: newValue});
            }}
            inputValue = {inputTag}
            onInputChange={(event, newValue) => {
                const candidateValue = newValue.trim();
                if (newValue !== candidateValue) {
                    if ((candidateValue !== '') && (!checkTag(candidateValue, formData.tags))) {
                        const selectedTags = formData.tags.concat({name: candidateValue});
                        setFormData({field: 'tags', value: selectedTags});
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
                        color={checkTag(option.name, tags) ? 'info' : 'warning'}
                        variant="filled"
                        label={option.name}
                        {...getTagProps({ index })}
                    />
                ))
            }

        />
        {/*------------------------------------------- Images ------- */}
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

                            {/*--- Mini toolbar --*/}
                            <Box sx={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                position: 'absolute', left: '0px', top: '0px'}}>

                                    <Fab aria-label="delete photo"
                                        onClick={onRemovePhoto(i)}
                                        size='small'
                                        sx={{marginLeft: '5px', marginTop: '10px', opacity: 0.7}}>
                                        <DeleteIcon sx={{color: "#a10666"}}/>
                                    </Fab>


                                    <Fab aria-label="pin photo"
                                    onClick={onPinPhoto(i)}
                                    size='small'
                                    disabled = {formData.photos.selected === i}
                                    sx={{marginRight: '5px', marginTop: '10px', opacity: 0.7}}>
                                        <PushPinIcon />
                                    </Fab>
                            </Box>

                         </Box>
                        )
                    }).concat(
                        /*--- Add photo slide --*/
                        <Box key={images.length} sx={{
                            width: '100%',
                            height: IMAGE_HEIGHT,
                            backgroundColor: '#eeeeee',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'column'}}>
                          <Fab color="primary" aria-label="add photo" onClick={onOpenCamera}>
                            <AddAPhotoIcon />
                          </Fab>
                          <Typography component="span" variant="h6" color="text.primary" align="justify" onClick={onOpenCamera}>
                               Click to add a photo
                          </Typography>
                          <input type='file' ref={inputFile} style={{display: 'none'}}
                            onChange={onTakePhoto}/>
                        </Box>
                    )
                }
             </Carousel>
         </React.Fragment>

        <Modal
            open={open}
            onClose={onPhotoCancel}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description">
            <Box sx={{
              width: '100%',
              height: '100vh',
              display: 'flex',
              backgroundColor: 'black',
              alignItems: 'center'
            }}>
             <Cropper
                  src={newPhoto}
                  style={{ width: "100%" }}
                  // Cropper.js options
                  viewMode={3}
                  guides={false}
                  ref={cropperRef}
                />
             <Fab aria-label="abort" onClick={onPhotoCancel}
                size='small'
                sx={{ position: 'fixed', top: 16, right: 16, opacity: 0.7}}>
                <CloseIcon />
             </Fab>
             <Fab aria-label="abort" onClick={onSavePhoto('sd')}
                size='small'
                sx={{ position: 'fixed', bottom: 16, left: 16, opacity: 0.7}}>
                <SdIcon />
             </Fab>
             <Fab aria-label="abort" onClick={onSavePhoto('hd')}
                size='small'
                sx={{ position: 'fixed', bottom: 16, right: 16, opacity: 0.7}}>
                <HdIcon />
             </Fab>
            </Box>
        </Modal>

        {/*-------------------------------------- Description ------- */}
        <TextField label="Description" name="description" variant="filled"  multiline maxRows={6} fullWidth
            value={formData.description || ''} onChange={handleChange} />

        {/*-------------------------------------- Locations  -------- */}
        <Autocomplete name="locations"
            multiple fullWidth freeSolo disableClearable
            options={locations}
            getOptionLabel={(option) => option.name}
            value={formData.locations || []}
            onChange={(event, newValue) => {
                setFormData({field: 'locations', value: newValue});
            }}
            inputValue = {inputLocation}
            onInputChange={(event, newValue) => {
                const candidateValue = newValue.trim();
                if (newValue !== candidateValue) {
                    if ((candidateValue !== '') && (!checkLocation(candidateValue, formData.locations))) {
                        const selectedLocations = formData.locations.concat({name: candidateValue});
                        setFormData({field: 'locations', value: selectedLocations});
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
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                    <Chip
                        color={checkLocation(option.name, locations) ? 'info' : 'warning'}
                        variant="filled"
                        label={option.name}
                        {...getTagProps({ index })}
                    />
                ))
            }

        />

        {/*-------------------------------------- Quantity  --------- */}
        <TextField name="quantity" label="Quantity" variant="filled" fullWidth
            type="number"
            value={formData.quantity || ''} onChange={handleChange} />

        {/*-------------------------------------- Cost  --------- */}
        <TextField name="cost" label="Cost" variant="filled" fullWidth
            type="number" InputProps={{ inputProps: { min: 0 } }}
            value={formData.cost || ''} onChange={handleChange} />

        {/*-------------------------------------- Expiration  ------- */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateField variant="filled" fullWidth maxDate='2200' format='DD / MM / YYYY'
           value={formData.expiration_date || null} onChange={handleChange}
           helperText={formError.expiration_date || ''}
           onError={handleDateError}/>
        </LocalizationProvider>

        {/*-------------------------------------- Code  ------------- */}
        <TextField name="code" label="Code" variant="filled" fullWidth
            value={formData.code || ''} onChange={handleChange} />

        {/*-------------------------------------- Control  ---------- */}

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
                type={action.type}
                disabled={action.disabled}
              />
            ))}
      </SpeedDial>

   </Stack>
   </form>
   </React.Fragment>
  );
}