const fs = require('node:fs/promises');
const path = require('path')

async function extractIrCommands() {
  try {
    console.log(process.cwd())
    const res = await fs.readFile('src/StoredData/ircommands.json', { encoding: 'utf-8' })
    console.log('res: ', res)
  } catch (e) {
    console.error(`Failed to extract ir commands: (${e.message})`)
  }
}

module.exports = { extractIrCommands }