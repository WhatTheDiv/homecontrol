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



    if ('*' === _d.slice(0, 1)) {
      this.log && console.log('(From Daemon Logging)', _d)
      return
    }
    else
      console.log('pushing input to outputs: ')

    const d = _d.indexOf('\n') >= 0 ? _d.slice(0, _d.indexOf('\n')) : _d

    console.log('(From Daemon)', d)
    this.outputs.push(d)

    if (this.outputs.length > this.maxCount)
      this.outputs.splice(0, 1)
  }

  init = async () => {
    const controller = new AbortController()

    try {
      const { spawn } = require('child_process')
      const process = spawn('python3 ./scripts/audioRelays.py', [], { cwd: './src/python', shell: true, signal: controller.signal })

      // process.stdin.write('hello from node! \n')

      process.on('disconnect', (data) => {
        console.log(`--- disconnected: ${data}`);
        controller.abort()
        this.process = null
        this.active = false
      });

      process.on('error', (e) => {
        // throw new Error(`stderr: ${data}`);
        console.log('--- errored: ', e)
        controller.abort()
        this.process = null
        this.active = false
      });

      process.on('close', (code) => {
        console.log(`--- closed: code ${code}`);
        controller.abort()
        this.process = null
        this.active = false
      });

      process.stdout.on('data', data => {


        this.processOutput.bind(this)(data)


      })

      process.stdin.on('data', data => {
        console.log('--- stdin data: ', data)
      })

      process.stderr.on('data', e => {
        console.log('--- stderr: ', e.toString())
        controller.abort()
        this.process = null
        this.active = false
      })

      this.process = process
      this.active = true

    } catch (e) {
      console.error('Error in child process: ', e)
      this.process = null
      this.active = false
      console.log('Exiting Daemon')
      controller.abort()
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
          res(false)
        }
        // -------------------- Return false if response success = false
        else if ((item.slice(item.indexOf('-') + 1)).toLowerCase() === 'false') {
          console.error('Daemon responded with fail...')
          status.failed = true;
          res()
        }
        // -------------------- Return true if found output at current count
        else {
          status.success = true
          status.index = index
          res()
        }
      }, duration);
    })
  }

  format_audio_and_temp_status_and_lights = ({ string, audio, lights }) => {
    const parseString = (str) => {
      console.log('Response from python Daemon === ', str)

      if (str.indexOf("success") >= 0 && str.slice(str.indexOf("success-" + 8), str.indexOf(",z1-")) === 'false') {
        console.log('Success false from python Daemon === ', str)

        return {
          z1_active: 'false',
          z2_active: 'false',
          temp: '98',
          humidity: '98',
          lights_active: 'false',
          animation: 'walk'

        }
      }
      else return {
        z1_active: (str.slice(str.indexOf('z1-') + 3, str.indexOf(',z2-'))).toLowerCase() === 't',
        z2_active: (str.slice(str.indexOf('z2-') + 3, str.indexOf(',t-'))).toLowerCase() === 't',
        temp: str.slice(str.indexOf(',t-') + 3, str.indexOf(',h-')),
        humidity: str.slice(str.indexOf(',h-') + 3, str.indexOf(',l-')),
        lights_active: str.slice(str.indexOf(',l-') + 3, str.indexOf(',a-')),
        animation: str.slice(str.indexOf(',a-') + 3)
      }
    }
    // [ count : zone1, zone2, temp, humidity, lightsActive, animation ]
    // 1:z1-True,z2-True,t-82.2,h-75.3,l-1,a-2

    const { z1_active, z2_active, temp, humidity, lights_active, animation } = parseString(string)

    const a = {
      zone_1: {
        ...audio.zone_1, updated: true, active: z1_active
      },
      zone_2: {
        ...audio.zone_2, updated: true, active: z2_active
      }
    }
    const t = {
      temp, humidity
    }

    const anim_nameFromIndex = (Object.keys(lights.Animations)).find(name => lights.Animations[name] === Number(animation))

    const l = {
      ...lights.state,
      lights_active: lights_active === '0' ? false : true,
      animation: anim_nameFromIndex === undefined ? -1 : anim_nameFromIndex,
      updated: true
    }

    return { a, t, l }
  }

  format_lights_state = ({ mode, name, value, lights }) => {
    const getAnimationName = (n, v) => {
      if (name !== undefined)
        return name.indexOf('default') >= 0
    }
    const newState = { ...lights.state }
    switch (m) {
      case 'animation':

        newState.animation_active = name && lights.ActiveAnimations.find(anim => anim === name) === undefined ? false : true
        // newState.animation = name ? name : 
        break;
      case 'color':
        break;
      case 'toggle':
        break;
    }
  }

  sendCommand = async ({ name, audioConfig = {}, lightsConfig = {}, tvCommand = '', Daemon }) => {
    // -------------------- Initialize variable object
    const obj = {}
    let output = ''

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
          if (tvCommand === '') throw new Error('No command given to TV')
          obj.name = 'i'
          obj.cmd = `c-${tvCommand}`
          break;
        case 'ir_Learn':
          obj.name = 'i'
          obj.cmd = `r`
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
      const status = { success: false, failed: false, index: -1 }

      // -------------------- Set Message Receipt Timeout
      setTimeout(() => status.failed = true, Daemon.checkTimeout_seconds * 1000);

      while (!status.success && !status.failed)
        await Daemon.check({ count: obj.count, duration: Daemon.checkInterval_ms, status })

      if (!status.success) throw new Error('Did not get receipt from Python script')
      else output = Daemon.outputs[status.index]

    } catch (e) {
      console.error(`(Daemon Receive Command) - ${e.message}`)
      return { err: true, message: `(Daemon Receive Command) - ${e.message}` }
    }

    // -------------------- Handle Receipt Block
    try {
      // -------------------- Parse Receipt
      const parsedCommand = Daemon.parseReceipt(name, output)

      return parsedCommand

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
    const r = { err: false, audio: {}, temp: {}, lights: {} }

    // -------------------- Parse receipt
    switch (name) {
      case 'audio_State': {
        const [z1, z2] = sections

        r.audio.z1 = Number(z1.slice(z1.indexOf('-') + 1)) === 0 ? false : true
        r.audio.z2 = Number(z2.slice(z2.indexOf('-') + 1)) === 0 ? false : true
        break;
      }
      case 'audio_Toggle': {
        const [z] = sections
        // r.audio[z1] = 0 ? false : true
        r.audio[0, z.indexOf('-')] = Number(z.slice(z.indexOf('-') + 1) === 0 ? false : true)
        break;
      }
      case 'temp_State': {
        const [t, h] = sections

        r.temp.indoorTemp = t.slice(t.indexOf('-') + 1)
        r.temp.indoorHumidity = h.slice(h.indexOf('-') + 1)
        break;
      }
      case 'all_State': {
        const [z1, z2, t, h] = sections

        r.audio.z1 = Number(z1.slice(z1.indexOf('-') + 1)) === 0 ? false : true
        r.audio.z2 = Number(z2.slice(z2.indexOf('-') + 1)) === 0 ? false : true
        r.temp.indoorTemp = t.slice(t.indexOf('-') + 1)
        r.temp.indoorHumidity = h.slice(h.indexOf('-') + 1)
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
        r.tv.lastCommand = c.slice(c.indexOf('-') + 1)
        break;
      }
      case 'ir_Learn': {
        const [r] = sections
        r.tv.IrCommandLearned = r.slice(r.indexOf('-') + 1)
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

