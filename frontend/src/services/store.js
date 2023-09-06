import { configureStore } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selectedItem: {name: null, id: null},
  token: null,
  itemsY: 0,
  itemCategory: 'active',
  items: [],
  tags: [],
  locations: [],
  searchFilter: [],
  visibleStats: {count: 0, cost: 0, tags: [], locations: []},
  isMultiEdit: false
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
    setItemCategory: (state, action) => {
      state.itemCategory = action.payload;
    },
    setItems: (state, action) => {
      state.items = action.payload;
    },
    setTags: (state, action) => {
      state.tags = action.payload;
    },
    setLocations: (state, action) => {
      state.locations = action.payload;
    },
    setSearchFilter: (state, action) => {
      state.searchFilter = action.payload;
    },
    setVisibleStats: (state, action) => {
      state.visibleStats = action.payload;
    },
    setIsMultiEdit: (state, action) => {
      state.isMultiEdit = action.payload;
    }
  },
})

export const {
    setSelectedItem,
    setToken,
    setYItems,
    setItemCategory,
    setItems,
    setTags,
    setLocations,
    setSearchFilter,
    setVisibleStats,
    setIsMultiEdit} = globalSlice.actions

export const store = configureStore({
  reducer: {
    global: globalSlice.reducer
  }
})