import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  power: false,
  input: { id: 'null', name: 'null' },
  sources: {
    list: [],
    defaultSource: 0,
    defaultSourceType: 'last'
  }
}

const tv = createSlice({
  name: 'tv',
  initialState,
  reducers: {
    setTvState: (state, action) => {
      if (action.payload.power !== undefined) state.power = action.payload.power
      if (action.payload.input !== undefined) state.input = action.payload.input
    },
    setSource: (state, action) => {
      if (action.payload.sourceList !== undefined && action.payload.sourceList >= 1)
        state.sources.list = action.payload.sourceList

      if (action.payload.defaultSource !== undefined)
        state.sources.defaultSource = action.payload.defaultSource

      if (action.payload.list.default !== undefined)
        state.sources.defaultSourceType = action.payload.defaultSourceType
    }
  }
})

export default tv.reducer

export const { setTvState, setSource } = tv.actions