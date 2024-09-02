// @ts-nocheck
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  commands: [],
  sources: [],
  services: [],
  lastCommand: {},
}

const ir = createSlice({
  name: 'ir',
  initialState,
  reducers: {
    addCommands: (state, action) => {
      if (action.payload.commands.length >= 1)
        action.payload.commands.forEach(cmdObj => {
          if (!state.commands.find(item => item.name === cmdObj.name)) {
            state.commands.push(cmdObj)
            if (!state.sources.find(item => item === cmdObj.source))
              state.sources.push(cmdObj.source)
          }
        });
    },
    addSources: (state, action) => {
      if (action.payload.sources.length >= 1)
        action.payload.sources.forEach(src => {
          if (!state.sources.find(item => item === src))
            state.sources.push(src)
        })
    },
    setLastCommand: (state, action) => {
      if (action.payload.lastCommand !== undefined) {
        state.lastCommand = state.commands.find(item => item.name === action.payload.lastCommand.name) || action.payload.lastCommand
      }
    },
    setServices_replace: (state, action) => {
      if (action.payload.services.length >= 1) {
        action.payload.services.forEach(service => {
          const existingServiceIndex = state.services.findIndex(stateService => stateService.Id === service.Id)
          if (existingServiceIndex < 0)
            state.services.push(service)
          else {
            state.services[existingService] = service
          }
        })
      }
    }
  }
})

export default ir.reducer

export const { addCommands, setLastCommand, addSources, setServices_replace } = ir.actions