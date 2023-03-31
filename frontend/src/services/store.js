import { configureStore } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selectedItem: {name: null, id: null},
  token: null,
  itemsY: 0
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
  },
})

export const { setSelectedItem, setToken, setYItems } = globalSlice.actions

export const store = configureStore({
  reducer: {
    global: globalSlice.reducer
  }
})