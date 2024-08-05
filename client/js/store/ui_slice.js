import { createSlice, createReducer } from '@reduxjs/toolkit'

const initialState = {
  loaded: { value: false },
  appFailMessage: { value: "" },
  dummyVals: false
}

const ui = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoaded: (state, action) => {
      state.loaded.value = action.payload
    },
    setFailMessage: (state, action) => {
      state.appFailMessage.value = !action.payload ? '' : action.payload
    }
  }
})

export default ui.reducer

export const { setLoaded, setFailMessage } = ui.actions