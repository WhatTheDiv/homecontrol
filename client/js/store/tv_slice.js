import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  power: false,
  input: { id: 'null', name: 'null' }
}

const tv = createSlice({
  name: 'tv',
  initialState,
  reducers: {
    setTvState: (state, action) => {
      if (action.payload.power !== undefined) state.power = action.payload.power
      if (action.payload.input !== undefined) state.input = action.payload.input
    },
  }
})

export default tv.reducer

export const { setTvState } = tv.actions