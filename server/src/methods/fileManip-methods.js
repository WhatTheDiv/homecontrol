const fs = require('node:fs/promises');
const path = require('path')

async function extractIrCommands() {
  const returnObj = {}
  const sources = []
  const commands = []

  try {
    const res = await fs.readFile('src/StoredData/ircommands.json', { encoding: 'utf-8' })
    return (JSON.parse(res)).IrCommands



  } catch (e) {
    console.error(`Failed to extract ir commands: (${e.message})`)
  }

}

module.exports = { extractIrCommands }