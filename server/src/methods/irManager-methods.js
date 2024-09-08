const fs = require('node:fs/promises');

class irManager {
  constructor({ ip, port }) {
    this.isAlive = false
    this.ip = ip
    this.port = port
    this.url = `http://${ip}:${port}`
    this.services = []
    return this
  }
  async activate({ IrCommands }) {
    this.isAlive = true

    if (IrCommands !== undefined)
      this.services = IrCommands
  }

  // returns status { success, fail, error, state}
  async sendCommand_audio({ command = '', zone = -1, state = null }) {
    const status = { success: false, fail: false, error: "", state: {} }
    if (!command && zone <= 0 && state === null) {
      status.fail = true
      status.error = 'malformed command'
      return status
    }

    const url = `http://${this.ip}:${this.port}`
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"
      }
    }

    if (command === 'getAudio') {
      options.body = JSON.stringify("getAudio")
    }
    else
      options.body = JSON.stringify(`setAudio/z${zone}-${state ? 1 : 0}`)

    try {
      const _arduinoResponse = await fetch(url, options)
      const arduinoResponse = (await _arduinoResponse.text()).trim();

      if (arduinoResponse.indexOf("fail") >= 0) {
        status.fail = true
        status.error = arduinoResponse.slice(arduinoResponse.indexOf("fail") + 5) || "noreason:("
        return status
      }

      // "success/z1-{active?}/z2-{active}"
      if (command === 'getAudio') {
        const stringIndex_z1 = arduinoResponse.indexOf("z1-") + 3
        const stringIndex_z2 = arduinoResponse.indexOf("z1-") + 3

        status.state = {
          z1: arduinoResponse.slice(stringIndex_z1, stringIndex_z1 + 1) === '0' ? false : true,
          z2: arduinoResponse.slice(stringIndex_z2, stringIndex_z2 + 1) === '0' ? false : true,
        }
      }


      status.success = true
      return status



    } catch (e) {
      console.error(`Error in "send audio" command: ${e.message}`)
      console.log(e)
      status.fail = true
      status.error = `Error in "send audio" command: ${e.message}`
      return status
    }

  }


  // returns status { success, fail, error, zoneNumber_state}
  async new_sendCommand_audio({ command = '', zone = -1, state = null }) {
    const status = { success: false, zoneNumber_state: {}, error: false, errorMessage: '' }

    try {
      if (!command && zone <= 0 && state === null)
        throw new Error(`Malformed command`)

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "text/plain"
        },
        body: JSON.stringify(
          command === 'getAudio'
            ? "getAudio"
            : `setAudio/z${zone}-${state
              ? 1
              : 0
            }`)
      }

      const arduinoResponse = (await fetch(this.url, options).then(async response => await response.text())).trim();

      if (arduinoResponse.indexOf("fail") >= 0)
        throw new Error(arduinoResponse.slice(arduinoResponse.indexOf("fail") + 5) || "noreason:'(")



      // "success/z1-{active?}/z2-{active}"
      if (command === 'getAudio') {
        console.log('(getAudio) arduino response: ', arduinoResponse)
        const stringIndex_z1 = arduinoResponse.indexOf("z1-") + 3
        const stringIndex_z2 = arduinoResponse.indexOf("z1-") + 3

        status.zoneNumber_state = {
          1: arduinoResponse.slice(stringIndex_z1, stringIndex_z1 + 1) === '0' ? false : true,
          2: arduinoResponse.slice(stringIndex_z2, stringIndex_z2 + 1) === '0' ? false : true,
        }
        console.log('status: ', status.zoneNumber_state)
      }

      status.success = true

    } catch (e) {
      status.error = true
      status.errorMessage = `---> Failed to set/get audio (${e.message})`
    } finally {
      return status

    }

  }

  // returns index of new command in commands or -1 for fail
  async createCommand({ name, source, commands, timeout_seconds = 10 }) {
    const verifyReceiptOfIr = async (receipt) => {
      return await new Promise(async res => {
        const url = `http://${this.ip}:${this.port}`
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "text/plain"
          },
          body: JSON.stringify("getIr")
        }

        const _response = await fetch(url, options)
        const response = (await _response.text()).trim()

        if (response.indexOf("fail") >= 0) {
          res(false)
        }
        else {
          receipt.code = response
          res(true)
        }

      })

    }
    const delay = async (T_millis) => {
      return await new Promise(res => {
        setTimeout(() => {
          res(true)
        }, T_millis);
      })
    }

    if (commands.find(item => item.name === name)) {
      console.error(`naming conflict, ${name} already exists`)
      return -1
    }

    const cmd = { name, source }
    const receipt_getIr = { success: false, fail: false, error: '', code: false }
    const url = `http://${this.ip}:${this.port}`
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"
      },
      body: JSON.stringify("newIr")
    }

    try {
      console.log("------ Beginning Learn ----------")
      const _arduinoResponse = await fetch(url, options)
      const arduinoResponse = (await _arduinoResponse.text()).trim()

      if (arduinoResponse.indexOf("success") < 0)
        throw new Error("Failed to execute 'Read' command.")
    } catch (e) {
      console.error(`Error sending learn command: ${e.message}`)
      console.log(e)
      return -1
    }

    try {
      await delay(1000)
      setTimeout(() => {
        receipt_getIr.fail = true
        receipt_getIr.error = 'timeout'
      }, timeout_seconds * 1000);

      console.group("Ir rcv")
      while (!receipt_getIr.success && !receipt_getIr.fail && !receipt_getIr.error && !receipt_getIr.code) {
        receipt_getIr.success = await verifyReceiptOfIr(receipt_getIr)
        await delay(1000);
        console.log(receipt_getIr)
      }
      console.groupEnd();

      if (receipt_getIr.error) throw new Error(receipt_getIr.error)
      else if (!receipt_getIr.code) throw new Error("No code returned")

    } catch (e) {
      console.error(`Error sending report command: ${e.message}`)
      console.log(e)
      return -1
    }

    const code = receipt_getIr.code
    cmd.command = code

    console.log(`Successfully saved command: ${JSON.stringify(cmd)}`)

    // returns index in commands
    return commands.push(cmd)
  }

  // returns status { success, fail, error }
  async testCommand(command, sourceId) {
    console.log('test command: ', { command, sourceId })
    const status = { success: false, fail: false, error: '' }

    try {
      if (command.source === undefined)
        throw new Error(`malformed request, no source given: ${JSON.stringify(command)}`)
      else if (command.code === undefined)
        throw new Error(`malformed request, no code given: ${JSON.stringify(command)}`)
      else if (sourceId < 0)
        throw new Error(`Source does not exist (${JSON.stringify(command.source)})`)


      const url = `http://${this.ip}:${this.port}`
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "text/plain"
        },
        body: JSON.stringify(`sendCommand/s${sourceId}-${command.code}`)
      }


      const _arduinoResponse = await fetch(url, options)
      const arduinoResponse = (await _arduinoResponse.text()).trim()

      if (arduinoResponse.indexOf('fail') >= 0)
        throw new Error(`Arduino responded with fail (${arduinoResponse.slice(arduinoResponse.indexOf("-") + 1)})`)

      status.success = true
      return status

    } catch (e) {
      console.error(`Arduino rejected request: ${e.message}`)
      status.fail = true
      status.error = `Arduino rejected request: ${e.message}`
      return status
    }

  }

  // returns status { success, fail, error }
  async sendCommand_ir({ name = false, index = -1, commands, sourceId }) {
    const status = { success: false, fail: false, error: "" }
    if (!name && index < 0) {
      status.fail = true
      status.error = 'No command reference given'
      return status
    }
    else if (sourceId < 0) {
      status.fail = true
      status.error = 'No source given for command'
      return status
    }

    const cmd = name ? commands.find(item => item.name === name) : commands[index]
    if (!cmd) {
      status.fail = true
      status.error = 'Command not found'
      return status
    }

    const url = `http://${this.ip}:${this.port}`
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"
      },
      body: JSON.stringify(`sendCommand/s${sourceId}-${cmd.command}`)
    }

    const _arduinoResponse = await fetch(url, options)
    const arduinoResponse = (await _arduinoResponse.text()).trim()

    if (arduinoResponse.indexOf('fail') >= 0) {
      status.fail = true
      status.error = 'Arduino failed to verify command'
      return status
    }

    status.success = true

    return status
  }

  // returns { success, error }
  async new_sendIrCommand({ commandName, source }) {
    const status = { success: false, error: '' }
    try {
      const { sourceId, commandCode } = this.extractCommand({ commandName, source })
      const url = `http://${this.ip}:${this.port}`
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "text/plain"
        },
        body: JSON.stringify(`sendCommand/s${sourceId}-${commandCode}`)
      }

      const response = await fetch(url, options).then(async res => (await res.text()).trim())

      if (response.indexOf('fail') >= 0)
        throw new Error(`Arduino responded with fail (${response})`)

      status.success = true;

    } catch (e) {
      status.error = `---> Failed to send Ir Command (${e.message})`
      console.error(e)
    }
    return status

  }

  // returns { sourceId, commandCode }
  extractCommand({ source, commandName }) {
    const service = this.services.find(service => service.Source === source)
    const sourceId = service.Id
    const commandCode = service.commands[commandName]

    return { sourceId, commandCode }
  }

}
module.exports = { irManager }