import React, {useEffect, useReducer, useState} from 'react';
import { useSelector } from 'react-redux'
import { useNavigation, useNavigate, useParams } from "react-router-dom";

import _ from "lodash";

import { loadItem, saveItem } from '../services/backend';

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
  const token = useSelector((state) => state.global.token);
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
            spacing={1}
            sx={{
                padding: '15px',
                opacity: (navigation.state === "loading") ? '0.25': '1.0',
                transition: 'opacity 200ms',
                transitionDelay: '200ms'
             }}>

        <TextField label="Name" name="name" variant="filled" fullWidth
            value={formData.name || ''} onChange={handleChange} />

        <TextField label="Description" name="description" variant="filled"  multiline maxRows={6} fullWidth
            value={formData.description || ''} onChange={handleChange} />

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