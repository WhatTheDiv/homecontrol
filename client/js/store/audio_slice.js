// @ts-nocheck
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  zones: [],
  sources: [],
  lastSourceSelected_id: 0,
  active: true
}

const audio = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setInitialAudio: (state, action) => {
      if (action.payload.zones !== undefined && action.payload.zones.length >= 1)
        state.zones = action.payload.zones

      if (action.payload.sources !== undefined && action.payload.sources.length >= 1)
        state.sources = action.payload.sources

      if (action.payload.lastSourceSelected_id !== undefined)
        state.lastSourceSelected_id = action.payload.lastSourceSelected_id

      if (action.payload.audioActive !== undefined)
        state.active = action.payload.audioActive

    },
    setLastSourceSelected_id: (state, action) => {
      if (action.payload.lastSourceSelected_id !== undefined)
        state.lastSourceSelected_id = action.payload.lastSourceSelected_id
    },
    setAudioActive: (state, action) => {
      if (action.payload.audioActive !== undefined)
        state.active = action.payload.audioActive
    },
    setZone: (state, action) => {
      if (action.payload.zone !== undefined) {
        const zoneIndex = state.zones.findId(z => z.id === action.payload.zone.id)
        if (zoneIndex >= 0)
          state.zones[zoneIndex] = action.payload.zone

      }
    }
  }
})

export default audio.reducer

export const { setLastSourceSelected_id, setAudioActive, setInitialAudio, setZone } = audio.actions