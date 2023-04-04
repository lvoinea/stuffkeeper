import { configureStore } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selectedItem: {name: null, id: null},
  token: null,
  itemsY: 0,
  tags: [],
  locations: []
}

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setYItems: (state, action) => {
      state.itemsY = action.payload;
    },
    setTags: (state, action) => {
      state.tags = action.payload;
    },
    setLocations: (state, action) => {
      state.locations = action.payload;
    },
  },
})

export const { setSelectedItem, setToken, setYItems, setTags, setLocations } = globalSlice.actions

export const store = configureStore({
  reducer: {
    global: globalSlice.reducer
  }
})