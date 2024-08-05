import { configureStore } from "@reduxjs/toolkit";
// import reducer from './reducer'
import { combineReducers } from 'redux'
import weather from './weather_slice'
import ui from './ui_slice'
import lights from './lights_slice'
import tv from './tv_slice'
import audio from './audio_slice.js'

export default configureStore({
  reducer: combineReducers({
    weather, ui, lights, tv, audio

  })
})