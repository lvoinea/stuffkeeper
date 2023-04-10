import React, {useEffect, useReducer, useState} from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useNavigation, useNavigate, useParams } from "react-router-dom";

import _ from 'lodash';
import dayjs from 'dayjs'

import { loadItem, saveItem, checkTag, checkLocation } from '../services/backend';
import {setTags, setLocations} from '../services/store';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import { DateField } from '@mui/x-date-pickers/DateField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import SaveIcon from '@mui/icons-material/Save';
import MoreVertIcon from '@mui/icons-material/MoreVert';


const formReducer = (state, action) => {
  return {
   ...state,
   [action.field]: action.value
  }
}



export default function ItemEditView() {

  const [item, setItem] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useReducer(formReducer, {});
  const [formError, setFormError] = useReducer(formReducer, {});
  const [inputTag, setInputTag] = useState('');
  const [inputLocation, setInputLocation] = useState('');

  const token = useSelector((state) => state.global.token);
  const tags = useSelector((state) => state.global.tags);
  const locations = useSelector((state) => state.global.locations);

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
        for (let field in l_item){
            // Need to deserialize expiration date
            if (field === 'expiration_date') {
                let value = l_item[field] ? dayjs(l_item[field]) : null;
                setFormData({field, value});
            } else if (field !== 'id') {
                setFormData({field: field, value: l_item[field]});
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