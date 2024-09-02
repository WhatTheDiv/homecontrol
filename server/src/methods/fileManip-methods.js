const fs = require('node:fs/promises');
const path = require('path')

async function extractIrCommands() {
  try {
    const res = await fs.readFile('../StoredData/ircommands.json', { encoding: 'utf-8' })
  } catch (e) {
    console.error(`Failed to extract ir commands: (${e.message})`)
  }
}

module.exports = { extractIrCommands }