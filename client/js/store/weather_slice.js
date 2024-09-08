import { createSlice, createReducer } from '@reduxjs/toolkit'

const initialState = {
  // currTemp: 0,
  outdoorTemp: 0,
  outdoorHumidity: 0,
  indoorTemp: 0,
  indoorHumidity: 0,
  // outdoorHigh: 0,
  // outdoorLow: 0,
  // outdoorHighTomorrow: 0,
  // outdoorLowTomorrow: 0,
  outdoorTemp_high: 0,
  outdoorTemp_low: 0,
  outdoorTemp_tomorrow_high: 0,
  outdoorTemp_tomorrow_low: 0,
  hot_feelsCold: 65,
  hot_feelsHot: 80,
  cold_feelsCold: 50,
  cold_feelsHot: 65,
  warmDay: 90,
  isWarmDay: true,
  feels: {
    warmDay: 70,
    isWarmDay: true,
    hotDay: {
      hot: 80,
      cold: 65,
      h_high: 60,
      h_low: 50
    },
    coldDay: {
      hot: 65,
      cold: 50,
      h_high: 40,
      h_low: 30
    },
    inside: {
      tooHot: 81,
      hot: 75,
      cold: 70,
      tooCold: 65,
      h_high: 60,
      h_low: 50
    }
  }
}

const weather = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    updateWeather: (state, action) => {
      if (action.payload.outdoorTemp !== undefined)
        state.outdoorTemp = action.payload.outdoorTemp

      if (action.payload.indoorTemp !== undefined)
        state.indoorTemp = action.payload.indoorTemp

      if (action.payload.indoorHumidity !== undefined)
        state.indoorHumidity = action.payload.indoorHumidity

      if (action.payload.outdoorHumidity !== undefined)
        state.outdoorHumidity = action.payload.outdoorHumidity

      if (action.payload.outdoorTemp_high !== undefined) {
        state.outdoorTemp_high = action.payload.outdoorTemp_high
        state.feels.isWarmDay = action.payload.outdoorTemp_high >= state.feels.warmDay ? true : false
      }

      if (action.payload.outdoorTemp_low !== undefined)
        state.outdoorTemp_low = action.payload.outdoorTemp_low

      if (action.payload.outdoorTemp_tomorrow_high !== undefined)
        state.outdoorTemp_tomorrow_high = action.payload.outdoorTemp_tomorrow_high

      if (action.payload.outdoorTemp_tomorrow_low !== undefined)
        state.outdoorTemp_tomorrow_low = action.payload.outdoorTemp_tomorrow_low

    },
    updateFeels: (state, action) => {
      if (action.payload.warmDay !== undefined) {
        state.feels.warmDay = action.payload.warmDay
        state.feels.isWarmDay = state.outdoorTemp_high >= action.payload.warmDay ? true : false
      }

      if (action.payload.hotDay?.hot !== undefined)
        state.feels.hotDay.hot = action.payload.hotDay?.hot

      if (action.payload.hotDay?.cold !== undefined)
        state.feels.hotDay.cold = action.payload.hotDay.cold

      if (action.payload.coldDay?.hot !== undefined)
        state.feels.coldDay.hot = action.payload.coldDay.hot

      if (action.payload.coldDay?.cold !== undefined)
        state.feels.coldDay.cold = action.payload.coldDay.cold

      if (action.payload.inside?.tooHot !== undefined)
        state.feels.inside.tooHot = action.payload.inside.tooHot

      if (action.payload.inside?.hot !== undefined)
        state.feels.inside.hot = action.payload.inside.hot

      if (action.payload.inside?.cold !== undefined)
        state.feels.inside.cold = action.payload.inside.cold

      if (action.payload.inside?.tooCold !== undefined)
        state.feels.inside.tooCold = action.payload.inside.tooCold
    }
  }
})

export default weather.reducer

export const { updateWeather, updateFeels } = weather.actions