// @ts-nocheck
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  commands: [],
  sources: []
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
            if (state.sources.find(item => item === cmdObj.source))
              state.sources.push(cmdObj.source)
          }


        });
    },
  }
})

export default ir.reducer

export const { addCommands } = ir.actions