// @ts-nocheck
class DaemonClass {
  constructor() {
    this.active = false
    this.process = null
    this.outputs = []
    this.count = 1
    this.maxCount = 10
    this.checkTimeout_seconds = 2
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

  inc = (count) => {
    if (count >= this.maxCount) return 1
    else if (count < this.maxCount) return count += 1
  }

  getCommand = ({ name, count, zone = -1, state = 0, lights }) => {

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

    // 1:a/z1-0                     = audio  =    [ count : name / zone - state ]
    // 2:l/at&z0-s0                     deleteThis      [ count: name  / action_toggle & zone - state ]
    // 3:l/aa&a1                    = lights =    [ count: name / action_animation & animationId ]
    // 4:l/ac&c-colorName(0,0,0,0)  = lights =    [ count: name / action_colorChange & color - name(r,g,b,w) ]            -- 13 char max length name
    // 5:l/as&                      = lights =    [ count: name / action_getState ]

    if (obj.cmd === null) return { err: true, message: "Bad input data to 'Daemon.getCommand' " }
    return { newCount: this.inc(count), command: `${obj.count}:${obj.name}/${obj.cmd && obj.cmd}\n` }
  }

  check = async ({ outputs, count, duration }) => {
    return await new Promise((res) => {

      setTimeout(() => {
        if (item === undefined) res(false)
        else if ((item.slice(item.indexOf('-') + 1)).toLowerCase() === 'false') res(false)
        else res(true)
      }, duration);

      const item = outputs.find((output) => Number(output.slice(0, output.indexOf(':'))) === count)

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
}

module.exports = { DaemonClass }

