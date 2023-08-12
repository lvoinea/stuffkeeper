import { configureStore } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selectedItem: {name: null, id: null},
  token: null,
  itemsY: 0,
  itemCategory: 'active',
  tags: [],
  locations: [],
  searchFilter: [],
  visibleStats: {count: 0, cost: 0}
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
    }
  },
})

export const {
    setSelectedItem,
    setToken,
    setYItems,
    setItemCategory,
    setTags,
    setLocations,
    setSearchFilter,
    setVisibleStats } = globalSlice.actions

export const store = configureStore({
  reducer: {
    global: globalSlice.reducer
  }
})