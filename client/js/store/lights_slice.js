import { createSlice, createReducer } from '@reduxjs/toolkit'

const initialState = {
  lightsOn: false,
  updated: false,
  animation: 'fade_off',
  animation_active: false,
  defaultAnimation: 'walk',
  defaultOnAnimation: 'fade_on',
  defaultOffAnimation: 'fade_off',
  colorOn: false,
  whiteOn: false,
  rgbColor: {
    r: 231,
    g: 100,
    b: 24
  },
  hslColor: {
    h: 100,
    s: 50,
    l: 50
  },
  Animations: {},
  ActiveAnimations: {},
  Zones: {},
}

const lights = createSlice({
  name: 'lights',
  initialState,
  reducers: {
    toggleLights_white: (state, action) => {
      state.whiteOn = action.payload
    },
    toggleLights_color: (state, action) => {
      state.colorOn = action.payload
    },
    setRGB: (state, action) => {
      console.log('setting rgb :', action.payload)
      state.rgbColor = action.payload
    },
    lights_setDefaults: (state, action) => {
      if (action.payload.defaultAnimation !== undefined) {
        state.defaultAnimation = action.payload.defaultAnimation
      }

      if (action.payload.defaultOnAnimation !== undefined) {
        state.defaultOnAnimation = action.payload.defaultOnAnimation
      }

      if (action.payload.defaultOffAnimation !== undefined) {
        state.defaultOffAnimation = action.payload.defaultOffAnimation
      }
    },

    lights_setInitial: (state, action) => {
      if (action.payload.colorOn !== undefined)
        state.colorOn = action.payload.colorOn

      if (action.payload.animation_active !== undefined)
        state.animation_active = action.payload.animation_active

      if (action.payload.whiteOn !== undefined)
        state.whiteOn = action.payload.whiteOn

      if (action.payload.rgbColor !== undefined)
        state.rgbColor = action.payload.rgbColor

      if (action.payload.lightsOn !== undefined)
        state.lightsOn = action.payload.lightsOn

      if (action.payload.updated !== undefined)
        state.updated = action.payload.updated

      if (action.payload.animation !== undefined)
        state.animation = action.payload.animation

      if (action.payload.Animations !== undefined)
        state.Animations = action.payload.Animations

      if (action.payload.ActiveAnimations !== undefined)
        state.ActiveAnimations = action.payload.ActiveAnimations

      if (action.payload.Zones !== undefined)
        state.Zones = action.payload.Zones
    }
  }
})

export default lights.reducer

export const { toggleLights_white,
  toggleLights_color, setRGB, lights_setInitial, lights_setDefaults } = lights.actions