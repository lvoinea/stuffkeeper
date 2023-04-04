import React, {useEffect, useReducer, useState} from 'react';
import { useSelector } from 'react-redux'
import { useNavigation, useNavigate, useParams } from "react-router-dom";

import _ from "lodash";

import { loadItem, saveItem, checkTag, checkLocation } from '../services/backend';

import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import SaveIcon from '@mui/icons-material/Save';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';


const formReducer = (state, action) => {
  return {
   ...state,
   [action.type]: action.payload
  }
}



export default function ItemEditView() {

  const [item, setItem] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useReducer(formReducer, {});
  const [inputTag, setInputTag] = useState('');
  const [inputLocation, setInputLocation] = useState('');

  const token = useSelector((state) => state.global.token);
  const tags = useSelector((state) => state.global.tags);
  const locations = useSelector((state) => state.global.locations);

  const { id } = useParams();
  const navigate = useNavigate();
  const navigation = useNavigation();

  if (error) {
    throw error;
  }

  useEffect(() => {
    async function fetchData() {
        let l_item = await loadItem({token, id})
        setItem(l_item);
        for (let field in l_item){
            if (field !== 'id') {
                setFormData({type: field, payload: l_item[field]});
            }
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
        if (!_.isEqual(item[field], formData[field])) {
            updatedItem[field] = formData[field];
            needsSaving = true;
        }
    }
    if (needsSaving){
        setIsSaving(true);
        await saveItem({token, item: updatedItem, id});
        // TODO: Update global tags and locations if new entries
        // have been provided.
        setIsSaving(false);
        navigate(-1);
    }
  }

  const handleChange = event => {
    const isCheckbox = event.target.type === 'checkbox';
    setFormData({
      type: event.target.name,
      payload: isCheckbox ? event.target.checked : event.target.value,
    })
  }

  const handleSave = async(event) => {
  }

  const handleCancel = async(event) => {
    navigate(-1);
  }

  const actions = [
      { icon: <SaveIcon />, name: 'Save', action: handleSave , type: 'submit'},
      { icon: <CloseIcon />, name: 'Cancel', action: handleCancel , type: 'button'},
   ];

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
                setFormData({type: 'tags', payload: newValue});
            }}
            inputValue = {inputTag}
            onInputChange={(event, newValue) => {
                const candidateValue = newValue.trim();
                if (newValue !== candidateValue) {
                    if ((candidateValue !== '') && (!checkTag(candidateValue, formData.tags))) {
                        const selectedTags = formData.tags.concat({name: candidateValue});
                        setFormData({type: 'tags', payload: selectedTags});
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
                setFormData({type: 'locations', payload: newValue});
            }}
            inputValue = {inputLocation}
            onInputChange={(event, newValue) => {
                const candidateValue = newValue.trim();
                if (newValue !== candidateValue) {
                    if ((candidateValue !== '') && (!checkLocation(candidateValue, formData.locations))) {
                        const selectedLocations = formData.locations.concat({name: candidateValue});
                        setFormData({type: 'locations', payload: selectedLocations});
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
            value={formData.quantity || ''} onChange={handleChange} />

        {/*-------------------------------------- Expiration  ------- */}

        {/*Expiration date + has expiration ? */}

        {/*-------------------------------------- Code  ------------- */}

        {/*Bar code*/}

        {/*-------------------------------------- Control  ---------- */}

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
                type={action.type}
              />
            ))}
      </SpeedDial>

   </Stack>
   </form>
   </React.Fragment>
  );
}