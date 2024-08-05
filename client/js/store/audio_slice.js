import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  zone_1: {
    name: 'Zone 1',
    active: false,
    updated: false
  },
  zone_2: {
    name: 'Zone 2',
    active: false,
    updated: false
  }
}

const audio = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setName: (state, action) => {
      if (action.payload.zone1_newName !== undefined) state.zone_1.name = action.payload.zone1_newName
      if (action.payload.zone2_newName !== undefined) state.zone_2.name = action.payload.zone2_newName

    },
    setActive: (state, action) => {
      if (action.payload.zone1_active !== undefined) state.zone_1.active = action.payload.zone1_active
      if (action.payload.zone1_updated !== undefined) state.zone_1.updated = action.payload.zone1_updated

      if (action.payload.zone2_active !== undefined) state.zone_2.active = action.payload.zone2_active
      if (action.payload.zone2_updated !== undefined) state.zone_2.updated = action.payload.zone2_updated
    }
  }
})

export default audio.reducer

export const { setName, setActive } = audio.actions