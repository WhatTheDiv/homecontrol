// @ts-nocheck
class DaemonClass {
  constructor() {
    this.active = false
    this.process = null
    this.outputs = []
    this.count = 1
    this.maxCount = 10
    this.checkTimeout_seconds = 1
    this.checkInterval_ms = 250
    this.log = true
  }

  processOutput = (data) => {
    const _d = data.toString()
    let e_flag = false



    if ('*' === _d.slice(0, 1)) {
      this.log && console.log('(From Daemon Logging)', _d)
      return
    }

    const d = _d.indexOf('\n') >= 0 ? _d.slice(0, _d.indexOf('\n')) : _d

    console.log('(From Daemon) Adding to outputs:', d)
    !e_flag && this.outputs.push(d)

    if (this.outputs.length > this.maxCount)
      this.outputs.splice(0, 1)
  }

  onDaemonError = (e, controller, type) => {
    console.error(`(Daemon) Daemon responded with error [${type}]: ${e.message}`)
    console.log(`(Daemon) Error -> ${e}`)
    controller.abort()
    this.process = null
    this.active = false
  }

  onDaemonClose = (code, controller) => {
    console.error(`(Daemon) Daemon has been closed: code(${code})`);
    controller.abort()
    this.process = null
    this.active = false
  }

  init = async () => {
    const controller = new AbortController()

    try {
      const { spawn } = require('child_process')
      const process = spawn('python3 ./scripts/audioRelays.py', [], { cwd: './src/python', shell: true, signal: controller.signal })

      process.on('disconnect', (data) => {
        console.log(`--- disconnected: ${data}`);
        controller.abort()
        this.process = null
        this.active = false
      });

      process.on('error', (e) => this.onDaemonError.bind(this)(e, controller, 'Error'));

      process.stderr.on('data', e => this.onDaemonError.bind(this)(e, controller, 'Stderr'))

      process.on('close', (code) => this.onDaemonClose.bind(this)(code, controller));

      process.stdout.on('data', data => this.processOutput.bind(this)(data))

      process.stdin.on('data', data => console.log('--- stdin data: ', data))

      this.process = process
      this.active = true

      const { err, message, lights } = await this.sendCommand({ name: "lights_Styles", Daemon: this })

      if (err)
        throw new Error(message)

      console.log(lights)

    } catch (e) {
      this.onDaemonError.bind(this)(e, controller, 'InitErr');
    }
  }

  inc = () => {
    this.count = this.count >= this.maxCount
      ? 1
      : this.count + 1
  }

  clearNextOutput = () => {
    if (this.outputs.length >= this.maxCount) {
      this.outputs[
        this.outputs.findIndex(output =>
          output && Number(output.slice(0, output.indexOf(':'))) == this.count)
      ] = undefined
    }
  }

  getCommand = ({ name, count, zone = -1, state = 0, lights }) => {
    /*
    
    ***************************************************************************************************
    ***************************************************************************************************
    ***********                      Creating Commands for Python                           ***********
    ***************************************************************************************************
    ***************************************************************************************************
    
    */

    const lights_command = ({ toggle, animation, animationId, setColor, zone, newState }) => {
      const newColor = setColor?.newColor
      const colorLabel = setColor?.colorLabel
      const rgbw = setColor?.rgbw

      // if (toggle) return ('at&z' + zone + '-s' + (newState === true ? '1' : '0'))
      console.log('test Daemon.js getCommand ', { animationId, toggle, animation })
      if (animation || toggle) return ('aa&a' + animationId)
      else if (newColor && rgbw) return 'ac&c-' + colorLabel + `(${rgbw.r},${rgbw.g},${rgbw.b},${rgbw.w})`
      else return null
    }

    if (!this.process)
      return { err: true, message: 'Daemon is dead' }

    const obj = { count }

    switch (name) {
      case 'audio':
        console.log('touching: ', 'audio')
        obj.name = 'a'
        obj.cmd = 'z' + zone + '-' + state
        break;
      case 'state':
        console.log('touching: state')
        obj.name = 's'
        obj.cmd = '&'
        break;
      case 'lights':
        console.log('touching: ', 'lights')
        obj.name = 'l'
        obj.cmd = lights_command(lights)
        break;
    }


    if (obj.cmd === null) return { err: true, message: "Bad input data to 'Daemon.getCommand' " }
    return { newCount: this.inc(count), command: `${obj.count}:${obj.name}/${obj.cmd && obj.cmd}\n` }
  }

  check = async ({ count, duration, status }) => {
    return await new Promise((res) => {
      setTimeout(() => {

        // -------------------- Search for receipt in outputs
        const index = this.outputs.findIndex((output) => output && Number(output.slice(0, output.indexOf(':'))) === count)
        const item = this.outputs[index]

        // -------------------- Return false if output was not found
        if (index < 0) {
          console.warn('Daemon has not responded yet...')
          status.success = false
          res(status)
        }
        // -------------------- Return false if response success = false
        else if ((item.slice(item.indexOf('-') + 1)).toLowerCase() === 'false') {
          console.error('Daemon responded with fail...')
          status.daemonErr = true;
          res(status)
        }
        // -------------------- Return true if found output at current count
        else {
          status.success = true
          status.index = index
          res(status)
        }
      }, duration);
    })
  }

  // returns parseReceipt = { err, message, audio: {}, temp: {}, lights: {}, tv: {} }
  sendCommand = async ({ name, audioConfig = {}, lightsConfig = {}, tvCommand = '', Daemon, extendedTimeout = 0 }) => {
    // -------------------- Initialize variable object
    const obj = {}
    let output = ''
    console.log('sending command ... ', name)

    // -------------------- Send Message Block
    try {
      // -------------------- Error handle if process not running
      if (!Daemon.process || !Daemon.active) throw new Error('Daemon is dead')

      // -------------------- Initialize variable object
      obj.count = Daemon.count

      // -------------------- Configure variable object
      switch (name) {
        case 'audio_State':
          obj.name = 'a'
          obj.cmd = 's'
          break;
        case 'audio_Toggle':
          obj.name = 'a'
          obj.cmd = `z${audioConfig.zone}-${audioConfig.newState ? 1 : 0}`
          break;
        case 'temp_State':
          obj.name = 't'
          obj.cmd = 's'
          break;
        case 'all_State':
          obj.name = 'z'
          obj.cmd = 's'
          break;
        case 'lights_State':
          obj.name = 'l'
          obj.cmd = 's'
          break;
        case 'lights_Styles':
          obj.name = 'l'
          obj.cmd = 'x'
          break;
        case 'lights_SetAnimation':
          if (lightsConfig.animationId === undefined) throw new Error(`Sending incomplete command, animationID: (${lightsConfig.animationId})`)
          obj.name = 'l'
          obj.cmd = 'a-' + lightsConfig.animationId
          break;
        case 'lights_Toggle':
          obj.name = 'l'
          obj.cmd = `l-${lightsConfig.newState ? 1 : 0}`
          break;
        case 'lights_SetColor':
          if (lightsConfig.color === undefined) throw new Error('No color given to set')
          else if (lightsConfig.colorName === undefined) throw new Error("No name given to SetColor")
          obj.name = 'l'
          obj.cmd = `c-(${lightsConfig.color.r},${lightsConfig.color.g},${lightsConfig.color.b},${lightsConfig.color.w}), b-${lightsConfig.brightness}, n-${lightsConfig.colorName}`
          break;
        case 'ir_Send':
          // if (tvCommand === '') throw new Error('No command given to TV')
          obj.name = 'i'
          obj.cmd = `c-cmd`
          break;
        case 'ir_Learn':
          obj.name = 'i'
          obj.cmd = `r`
          break;
        case 'ir_Report':
          obj.name = 'i'
          obj.cmd = 'x'
          break;
        default:
          throw new Error(`Sending incomplete command, or bad command name (${name})`)
          break
      }

      // -------------------- Prep Daemon for next message
      Daemon.clearNextOutput()
      Daemon.inc()

      // -------------------- Write new message
      console.log('writing message to python: ' + `${obj.count}:${obj.name}/${obj.cmd}\n`)
      Daemon.process.stdin.write(`${obj.count}:${obj.name}/${obj.cmd}\n`)


    } catch (e) {
      console.error(`(Daemon Send Command) - ${e.message}`)
      return { err: true, message: `(Daemon Send Command) - ${e.message}` }
    }

    // -------------------- Receive Message Block
    try {
      // -------------------- Set Status flags
      let status = { success: false, failed: false, daemonErr: false, index: -1 }

      // -------------------- Set Message Receipt Timeout
      const t = setTimeout(() => status.failed = true, (extendedTimeout <= 0 ? Daemon.checkTimeout_seconds : extendedTimeout) * 1000);

      while (!status.success && !status.failed && !status.daemonErr) {
        status = { ... await Daemon.check({ count: obj.count, duration: Daemon.checkInterval_ms, status }) }
      }

      clearTimeout(t)


      if (status.daemonErr) throw new Error('Python responded with fail')
      if (status.failed) throw new Error('Did not get receipt from Python script')
      else output = Daemon.outputs[status.index]

    } catch (e) {
      console.error(`(Daemon Receive Command) - ${e.message}`)
      return { err: true, message: `(Daemon Receive Command) - ${e.message}` }
    }

    // -------------------- Handle Receipt Block
    try {
      // -------------------- Parse Receipt
      return Daemon.parseReceipt(name, output)

    } catch (e) {
      console.error(`(Daemon Parse Receipt) - ${e.message}`)
      return { err: true, message: `(Daemon Parse Receipt) - ${e.message}` }
    }
  }

  parseReceipt = (name, output) => {
    // -------------------- Break output into sections
    const trimmedOutput = output.slice(output.indexOf(':') + 1)
    const sections = trimmedOutput.split('/')

    // -------------------- Initialize return object
    const r = { err: false, audio: {}, temp: {}, lights: {}, tv: {} }

    // -------------------- Parse receipt
    switch (name) {
      case 'audio_State': {
        const [z1, z2, e] = sections
        r.audio.updated = Number(e.slice(e.indexOf('-') + 1)) === 0 ? true : false
        r.audio.z1 = Number(z1.slice(z1.indexOf('-') + 1)) === 0 ? false : true
        r.audio.z2 = Number(z2.slice(z2.indexOf('-') + 1)) === 0 ? false : true
        break;
      }
      case 'audio_Toggle': {
        const [z, e] = sections
        // r.audio[z1] = 0 ? false : true
        r.audio[0, z.indexOf('-')] = Number(z.slice(z.indexOf('-') + 1) === 0 ? false : true)
        r.audio.updated = Number(e.slice(e.indexOf('-') + 1)) === 0 ? true : false
        break;
      }
      case 'temp_State': {
        const [t, h] = sections

        r.temp.indoorTemp = t.slice(t.indexOf('-') + 1)
        r.temp.indoorHumidity = h.slice(h.indexOf('-') + 1)
        break;
      }
      case 'all_State': {
        const [z1, z2, e, t, h] = sections

        r.audio.z1 = Number(z1.slice(z1.indexOf('-') + 1)) === 0 ? false : true
        r.audio.z2 = Number(z2.slice(z2.indexOf('-') + 1)) === 0 ? false : true
        r.audio.updated = Number(e.slice(e.indexOf('-') + 1)) === 0 ? true : false
        r.temp.indoorTemp = t.slice(t.indexOf('-') + 1)
        r.temp.indoorHumidity = h.slice(h.indexOf('-') + 1)
        break;
      }
      case 'lights_Styles': {
        const [a, s] = sections
        const animationStyles = a.split(',')
        const changeStateStyles = s.split(',')

        console.log("parseReceipt, sections: ", { animationStyles, changeStateStyles })
        r.lights.animationStyles = [...animationStyles]
        r.lights.changeStateStyles = [...changeStateStyles]
        break;
      }
      case 'lights_State':
      case 'lights_SetAnimation':
      case 'lights_Toggle': {
        const [l, a] = sections

        console.log(sections)
        r.lights.active = Number(l.slice(l.indexOf('-') + 1)) === 0 ? false : true
        r.lights.animation = a.slice(a.indexOf('-') + 1)
        break;
      }
      case 'lights_SetColor': {
        const [c, b, n] = sections
        const [red, green, blue, white] = (c.slice(3, c.indexOf(')'))).split(',')

        r.lights.name = n
        r.lights.brightness = b
        r.lights.color = { red, green, blue, white }
        break;
      }
      case 'ir_Send': {
        const [c] = sections
        r.tv.commandSent = true;
        break;
      }
      case 'ir_Learn': {
        r.tv.IrCommandLearnMode = true
        break;
      }
      case 'ir_Report': {
        const [c] = sections
        r.tv.newCommand = c.slice(c.indexOf('-') + 1)
        break;
      }
      default:
        throw new Error(`Out of bounds (${name})`)
        break;
    }

    return r
  }
}

module.exports = { DaemonClass }

