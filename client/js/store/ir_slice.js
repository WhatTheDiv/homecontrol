// @ts-nocheck
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  commands: [],
  sources: [],
  lastCommand: {}
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
    setLastCommand: (state, action) => {
      if (action.payload.lastCommand !== undefined) {
        state.lastCommand = state.commands.find(item => item.name === action.payload.lastCommand.name) || action.payload.lastCommand
      }
    }
  }
})

export default ir.reducer

export const { addCommands, setLastCommand } = ir.actions