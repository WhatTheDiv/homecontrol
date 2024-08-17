const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000 //process.argv[2] === 'live' ? 3000 : 3001
const { handleButtonPress, getTvState, test } = require('./methods/tv-methods.js')
const { getIndoorTempReading } = require('./methods/gpio-methods.js')
const { DaemonClass } = require('./methods/Daemon')

app.use(cors())
app.use(express.json())

const HomeState = {
  lights: {
    state: {
      lights_active: false,
      animation_active: false,
      animation: 'walk',
      updated: false,
    },
    color_active: false,
    white_active: false,
    red: 236,
    green: 181,
    blue: 119,
    Colors: {
      // (r, b, g, w)
      off: '(0,0,0,0)',
      primary: '(0,0,0,50)',
      secondary: '(30,10,0,1)'
    },
    defaultAnimation: 'walk',
    defaultOnAnimation: 'fade_on',
    defaultOffAnimation: 'fade_off',
    Animations: {
      // update with arduino reference
      walk: 0, slide_on: 1, fade_on: 2, fade_off: 3, spot: 4
    },
    ActiveAnimations: [
      'walk', 'spot'
    ],
    Zones: { all: 0, livingRoom: 1, kitchen: 2, bedroom: 3 }
  },
  temp: {
    indoor_temp: 0,
    indoor_humidity: 0,
    showTwoDay: true
  },
  tv: {
    power: false,
    input: { id: 'null', name: 'null' },
    inputs: [],
    menuInput: { id: 'null', name: 'null' },
    tvURL: 'http://192.168.10.109:8060'
  },
  audio: {
    zone_1: {
      name: "Bedroom",
      active: true,
      updated: true
    },
    zone_2: {
      name: "Living Room",
      active: true,
      updated: true
    }
  }

}

const Daemon = new DaemonClass()

app.get('/initialState', async (req, res) => {
  // Get tv state // 
  HomeState.tv = { ...HomeState.tv, ... await getTvState(HomeState.tv) }

  // Get audio state & temp // 
  if (!Daemon.active || !Daemon.process) {
    HomeState.audio.zone_1.updated = false
    HomeState.audio.zone_1.active = true
    HomeState.audio.zone_2.updated = false
    HomeState.audio.zone_2.active = true
    return res.status(200).send({ ...HomeState })
  }


  const count = Daemon.count
  const { newCount, command, err, message } = Daemon.getCommand({ name: 'state', count, lights: {} })

  if (err) return res.status(502).send({ message: 'Deamon failed at send: ' + message, success: false })
  Daemon.count = newCount

  Daemon.process.stdin.write(command)

  const p = { success: false, failed: false }

  setTimeout(() => p.failed = true, Daemon.checkTimeout_seconds * 1000);

  while (!p.success && !p.failed)
    p.success = await Daemon.check({ outputs: Daemon.outputs, count, duration: 250, pass: p })


  if (p.success) {
    console.log('successful response from daemon')
    const { a, t, l } = Daemon.format_audio_and_temp_status_and_lights({
      audio: HomeState.audio,
      lights: HomeState.lights,
      string: Daemon.outputs.find(string => string.indexOf(`${count}:`) >= 0)
    })
    const { temp, humidity } = t

    HomeState.audio = a
    HomeState.temp.indoor_temp = temp
    HomeState.temp.indoor_humidity = humidity
    HomeState.lights.state = { ...l }
  }
  else {
    console.error("Audio, temp, and lights are not updated!")
    HomeState.audio.zone_1.updated = false
    HomeState.audio.zone_2.updated = false
    HomeState.lights.state.updated = false
  }




  res.status(200).send({ ...HomeState })
})

app.get('/test', async (req, res) => {
  console.log('hitting tester')
  if (!Daemon.active || !Daemon.process) {
    return res.status(200).send({ success: false })
  }

  Daemon.process.stdin.write('t\n')

  res.status(200).send({ success: true })
})

app.post('/setLights', async (req, res) => {
  const setupCommand_animation = (n) => {
    if (!n || HomeState.lights.Animations[n] === undefined)
      return {
        failed: true,
        initialValues: {
          input_animationName: n,
          resolvedAnimationId: HomeState.lights.Animations[n],
          animationList: HomeState.lights.Animations
        }
      }



    return {
      animation: true,
      animationId: HomeState.lights.Animations[n],
      animationName: n
    }
  }
  const setupCommand_toggle = (v) => {
    if (v === undefined)
      return {
        failed: true,
        initialValues: {
          input_newState: v
        }
      }
    const animationName = v ? HomeState.lights.defaultOnAnimation : HomeState.lights.defaultOffAnimation

    return {
      toggle: true,
      animationId: HomeState.lights.Animations[v ? HomeState.lights.defaultOnAnimation : HomeState.lights.defaultOffAnimation],
      animationName
    }
  }
  const setupCommand_color = (label, rgbw) => {
    if (!label || !rgbw)
      return {
        failed: true,
        initialValues: {
          input_Label: label, input_RGBW: rgbw
        }
      }

    return {
      setColor: {
        newColor: true,
        colorLabel: label,
        rgbw
      }
    }
  }

  const setupLightsObject = (m, n, v) => {
    switch (m) {
      case 'animation':
        return setupCommand_animation(n.indexOf('default') >= 0 ? HomeState.lights[n] : n)
      case 'color':
        return setupCommand_color(n, v)
      case 'toggle':
        console.log(' server, setting command to toggle')
        return setupCommand_toggle(v)
      default:
        return {
          failed: true,
          initialValue: {
            mode: m,
            name: n,
            value: v
          }
        }
    }
  }

  const { mode, name, value } = req.body
  // mode = 'animation' || 'color'
  // name = animationName, colorName

  console.log('From client: ', { mode, name, value })

  if (!Daemon.active || !Daemon.process) {
    return res.status(502).send({ message: 'Daemon is inactive' })
  }

  const count = Daemon.count
  const lights = setupLightsObject(mode, name, value)

  if (lights.failed)
    return res.status(502).send({ Success: false, Message: 'Bad inputs given to server @ /setLightsScheme for ' + mode, helper: lights.initialValues })

  const { newCount, command, err, message } = Daemon.getCommand({
    name: 'lights',
    count,
    lights
  })
  console.log('Command created: ', command)

  if (err) return res.status(502).send({ message: 'Deamon failed at send: ' + message, success: false })

  Daemon.count = newCount
  Daemon.process.stdin.write(command)

  const p = { success: false, failed: false }

  const ref = setTimeout(() => p.failed = true, Daemon.checkTimeout_seconds * 1000);

  while (!p.success && !p.failed)
    p.success = await Daemon.check({ outputs: Daemon.outputs, count, duration: 250 })

  if (p.success) {
    clearTimeout(ref)
    console.log('Good response from arduino')
    res.status(200).send({ Success: true, message: 'Good response from arduino ', lights })
    // [ ] Set light state in HomeState
  } else {
    console.log('bad response from arduino')
    res.status(502).send({ Success: false, message: 'Arduino failed to respond' })

  }
})

app.post('/toggleAudioZones', async (req, res) => {
  const { zone, newState } = req.body

  if (!Daemon.active || !Daemon.process)
    return res.status(502).send({ message: 'Deamon inactive', success: false })

  const count = Daemon.count
  const { newCount, command, err, message } = Daemon.getCommand({ name: 'audio', zone, state: newState ? 1 : 0, count, lights: {} })

  if (err) return res.status(502).send({ message: 'Deamon failed at send: ' + message, success: false })

  Daemon.count = newCount
  Daemon.process.stdin.write(command)

  const p = { success: false, failed: false }

  setTimeout(() => p.failed = true, Daemon.checkTimeout_seconds * 1000);

  while (!p.success && !p.failed)
    p.success = await Daemon.check({ outputs: Daemon.outputs, count, duration: 250 })

  if (p.success) return res.status(200).send({ success: true }).end()

  res.status(502).send({ message: 'Daemon failed at receive', success: false }).end()

})

app.post('/toggleLightsActive', async (req, res) => {
  const { newState } = req.body
  // mode = 'animation' || 'color'
  // name = animationName, colorName

  console.log('/toggleLightsActive - From client: ', { newState })

  if (!Daemon.active || !Daemon.process) {
    return res.status(502).send({ message: 'Daemon is inactive' })
  }

  const count = Daemon.count
  const lights = {
    newState,
    toggle: true,
    animationId: HomeState.lights.Animations[newState ? HomeState.lights.defaultOnAnimation : HomeState.lights.defaultOffAnimation],
    animationName: newState ? HomeState.lights.defaultOnAnimation : HomeState.lights.defaultOffAnimation
  }

  if (lights.animationId === undefined) {
    return res.status(502).send({ Success: false, Message: 'Bad inputs given to server @ /toggleLightsActive.', lights })
  }

  const updater = {
    lights_active: newState,
    animation_active: HomeState.lights.ActiveAnimations.find(anim => anim === lights.animationName) === undefined ? false : true,
    animation: lights.animationName,
    updated: true,
  }

  const { newCount, command, err, message } = Daemon.getCommand({
    name: 'lights',
    count,
    lights
  })
  console.log('Command created: ', command)

  if (err) return res.status(502).send({ message: 'Deamon failed at send: ' + message, success: false })

  Daemon.count = newCount
  Daemon.process.stdin.write(command)

  const p = { success: false, failed: false }

  const ref = setTimeout(() => p.failed = true, Daemon.checkTimeout_seconds * 1000);

  while (!p.success && !p.failed)
    p.success = await Daemon.check({ outputs: Daemon.outputs, count, duration: 250 })

  clearTimeout(ref)
  if (p.success) HomeState.lights.state = { ...updater }
  const response = {
    Success: p.success,
    message: p.success ? 'Arduino received command' : 'Arduino may have not received command',
    lights,
    state: HomeState.lights.state
  }
  console.log(response.message)
  res.status(p.success ? 200 : 502).send(response)

})

app.post('/setLightsAnimation', async (req, res) => {
  const { _animationName } = req.body

  console.log('From client: ', { _animationName })

  if (!Daemon.active || !Daemon.process) {
    return res.status(502).send({ message: 'Daemon is inactive' })
  }

  const count = Daemon.count

  const animationName = _animationName.indexOf('default') >= 0
    ? HomeState.lights[_animationName]
    : _animationName

  const lights = {
    animation: true,
    animationId: HomeState.lights.Animations[animationName],
    animationName
  }

  if (lights.animationId === undefined) {
    return res.status(502).send({ Success: false, Message: 'Bad inputs given to server @ /setLightsAnimation.', lights })
  }

  const updater = {
    lights_active: true,
    animation_active: HomeState.lights.ActiveAnimations.find(anim => anim === lights.animationName) === undefined ? false : true,
    animation: animationName,
    updated: true,
  }

  const { newCount, command, err, message } = Daemon.getCommand({
    name: 'lights',
    count,
    lights
  })

  console.log('Command created: ', command)

  if (err) return res.status(502).send({ message: 'Deamon failed at send: ' + message, success: false })

  Daemon.count = newCount
  Daemon.process.stdin.write(command)

  const p = { success: false, failed: false }

  const ref = setTimeout(() => p.failed = true, Daemon.checkTimeout_seconds * 1000);

  while (!p.success && !p.failed)
    p.success = await Daemon.check({ outputs: Daemon.outputs, count, duration: 250 })

  clearTimeout(ref)
  if (p.success) HomeState.lights.state = { ...updater }
  const response = {
    Success: p.success,
    message: p.success ? 'Arduino received command' : 'Arduino may have not received command',
    lights,
    state: HomeState.lights.state
  }
  console.log(response.message)
  res.status(p.success ? 200 : 502).send(response)

})

app.post('/updateDefaultAnimations', async (req, res) => {
  const { _animationName, _animation, } = req.body

  if (_animationName === undefined || _animation === undefined || HomeState.lights[_animation] === undefined)
    res.status(400).send({ message: 'Bad inputs given (_animationName: ' + _animationName + ',_animation: ' + _animation + ')' })

  HomeState.lights[_animation] = _animationName

  res.status(200).send({ message: 'Success', lights: HomeState.lights })
})

app.post('/setLightsColor', async (req, res) => {

})

app.post('/setZoneName', ((req, res) => {
  const { zone, newName } = req.body
  if (!zone || newName.length <= 0 || newName.length > 20)
    return res.status(406).send({ message: 'Missing zone or name missing criteria' }).end()

  console.log('Good name change: ', newName)
  HomeState.audio[`zone_${zone}`].name = newName
  return res.status(200).end()
}))

app.post('/setColor', (req, res) => {
  const { r, g, b } = req.body.output
  console.log(req.body.action, ': ', { r, g, b })
  res.status(200).end()
})

app.post('/remote', async (req, res) => {
  console.log('Button pressed (', req.body.button, ')')

  const response = await handleButtonPress(req.body.button, HomeState.tv, HomeState.tv.tvURL)



  // If button pressed was 'power' or an 'input'
  if (response?.setting !== undefined)
    if (response.setting === "input" && !HomeState.tv.power) {
      HomeState.tv.power = true
      HomeState.tv.input = response.newState
    }
    else
      HomeState.tv[response.setting] = response.newState

  if (req.body.button === 'power')
    HomeState.tv = { ...HomeState.tv, ... await getTvState(HomeState.tv) }
  else getTvState(HomeState.tv).then(newState => {
    HomeState.tv = { ...HomeState.tv, ...newState }
  })


  res.status(200).send({
    success: response.success,
    error: response.errorMessage,
    setting: response?.setting === undefined ? false : response.setting,
    power: HomeState.tv.power,
    input: HomeState.tv.input
  })
})

app.listen(port, () => {
  Daemon.init.bind(Daemon)()
  console.log('Starting server on port [', port, '] ')
})



