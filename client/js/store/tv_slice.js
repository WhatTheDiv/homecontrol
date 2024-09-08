import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  power: false,
  input: { id: 'null', name: 'null' },
  video: {
    videoSources: [],
    lastSource_id: 0,
    defaultSource: 'last'
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
      if (action.payload.videoSources !== undefined && action.payload.videoSources.length >= 1)
        state.video.videoSources = action.payload.videoSources

      if (action.payload.defaultSource !== undefined)
        state.video.defaultSource = action.payload.defaultSource

      if (action.payload.lastSource_id !== undefined)
        state.video.lastSource_id = action.payload.lastSource_id
    }
  }
})

export default tv.reducer

export const { setTvState, setSource } = tv.actions