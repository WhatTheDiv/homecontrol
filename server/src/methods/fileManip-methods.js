const fs = require('node:fs/promises');
const path = require('path')

async function extractIrCommands() {
  const returnObj = {}
  try {
    const res = await fs.readFile('src/StoredData/ircommands.json', { encoding: 'utf-8' })
    returnObj.irData = (JSON.parse(res)).IrCommands
  } catch (e) {
    console.error(`Failed to extract ir commands: (${e.message})`)
    returnObj.irData = {}
  }
}

module.exports = { extractIrCommands }