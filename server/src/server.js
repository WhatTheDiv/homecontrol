const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000 //process.argv[2] === 'live' ? 3000 : 3001
const { handleButtonPress, getTvState, test } = require('./methods/tv-methods.js')
const { getIndoorTempReading } = require('./methods/gpio-methods.js')
const { DaemonClass } = require('./methods/Daemon')
const localMethods = require('./methods/server-methods.js')

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
    showTwoDay: true,
    updated: false
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

  const tempAndAudio = await Daemon.sendCommand({ name: 'all_State', Daemon })
  const lightsState = await Daemon.sendCommand({ name: 'lights_State', Daemon })

  const { audio, temp } = tempAndAudio
  const { lights } = lightsState

  if (tempAndAudio.err) {
    HomeState.audio.zone_1.updated = false
    HomeState.audio.zone_2.updated = false
    HomeState.temp.updated = false
  } else {
    HomeState.audio.zone_1.updated = true
    HomeState.audio.zone_1.active = audio.z1

    HomeState.audio.zone_2.updated = true
    HomeState.audio.zone_2.active = audio.z2

    HomeState.temp.updated = true
    HomeState.temp.indoor_temp = temp.indoorTemp
    HomeState.temp.indoor_humidity = temp.indoorHumidity
  }

  if (lightsState.err) {
    HomeState.lights.state.updated = false
  } else {
    HomeState.lights.state.updated = true
    HomeState.lights.state.lights_active = lights.active

    const a = HomeState.lights.Animations
    HomeState.lights.state.animation = (Object.keys(a)).find(animName => a[animName] === lights.animation) || 'walk'
    HomeState.lights.state.animation_active = HomeState.lights.ActiveAnimations.indexOf(HomeState.lights.state.animation) >= 0 ? true : false
  }

  res.status(200).send({ ...HomeState })
})

app.post('/test', async (req, res) => {
  console.log('hitting tester')
  const { learn, report, send } = req.body

  if (learn) {
    const { err, message, tv } = await Daemon.sendCommand({ name: 'ir_Learn', Daemon })
    if (err) console.error(message)
    console.log('ir - learn: ', tv)
  }
  else if (report) {
    const { err, message, tv } = await Daemon.sendCommand({ name: 'ir_Report', Daemon })
    if (err) console.error(message)
    console.log('ir - report: ', tv)
  }
  else if (send) {
    const { err, message, tv } = await Daemon.sendCommand({ name: 'ir_Send', Daemon })
    if (err) console.error(message)
    console.log('ir - send: ', tv)
  }

  res.status(200).send({ success: true })
})

app.get('/espTest', async (req, res) => {
  const { item } = req.body

  console.log('touch')

  res.status(200).send('Something from the server!');
})

app.post('/espTouch', async (req, res) => {
  console.log("Touching /espTouch")

  try {
    const ard = await fetch("http://192.168.2.116:80", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"
      },
      body: JSON.stringify("getAudio")
    })


    res.send({ response: (await ard.text()).trim() }).end()

  } catch (e) {
    console.error('problem reaching host')
    console.log(e)
    res.sendStatus(502).end()
  }


})

app.post('/toggleAudioZones', async (req, res) => {
  const { zone, newState } = req.body

  const { err, audio } = await Daemon.sendCommand({ name: 'audio_Toggle', Daemon, audioConfig: { zone, newState } })

  if (err) {
    HomeState.audio.zone_1.updated = false
    HomeState.audio.zone_2.updated = false
  } else {
    if (audio.z1 !== undefined) {
      HomeState.audio.zone_1.updated = true
      HomeState.audio.zone_1.active = audio.z1
    }
    if (audio.z2 !== undefined) {
      HomeState.audio.zone_2.updated = true
      HomeState.audio.zone_2.active = audio.z2
    }
  }

  return res.status(200).send({ success: !err }).end()
})

app.post('/toggleLightsActive', async (req, res) => {
  const { newState } = req.body
  // mode = 'animation' || 'color'
  // name = animationName, colorName

  const { err, lights } = await Daemon.sendCommand({ name: 'lights_Toggle', lightsConfig: { newState }, Daemon })

  if (err) {
    HomeState.lights.state.updated = false
  } else {
    HomeState.lights.state.updated = true
    HomeState.lights.state.lights_active = lights.active

    const a = HomeState.lights.Animations
    HomeState.lights.state.animation = (Object.keys(a)).find(animName => a[animName] === lights.animation) || 'walk'
    HomeState.lights.state.animation_active = HomeState.lights.ActiveAnimations.indexOf(HomeState.lights.state.animation) >= 0 ? true : false
  }

  res.status(200).send({ success: !err, state: HomeState.lights.state })

  // const response = {
  //   Success: p.success,
  //   message: p.success ? 'Arduino received command' : 'Arduino may have not received command',
  //   lights,
  //   state: HomeState.lights.state
  // }

})

app.post('/setLightsAnimation', async (req, res) => {
  const { _animationName } = req.body

  const animationName = _animationName.indexOf('default') >= 0
    ? HomeState.lights[_animationName]
    : _animationName

  const { err, lights } = await Daemon.sendCommand({
    name: "lights_SetAnimation",
    lightsConfig: { animationId: HomeState.lights.Animations[animationName] },
    Daemon
  })

  if (err) {
    HomeState.lights.state.updated = false
  } else {
    HomeState.lights.state.updated = true
    HomeState.lights.state.lights_active = lights.active

    const a = HomeState.lights.Animations
    HomeState.lights.state.animation = (Object.keys(a)).find(animName => a[animName] === lights.animation) || 'walk'
    HomeState.lights.state.animation_active = HomeState.lights.ActiveAnimations.indexOf(HomeState.lights.state.animation) >= 0 ? true : false
  }

  res.status(err ? 502 : 200).send({ Success: !err, state: HomeState.lights.state })



  // const response = {
  //   Success: p.success,
  //   message: p.success ? 'Arduino received command' : 'Arduino may have not received command',
  //   lights,
  //   state: HomeState.lights.state
  // }

})

app.post('/updateDefaultAnimations', async (req, res) => {
  const { _animationName, _animation, } = req.body

  if (_animationName === undefined || _animation === undefined || HomeState.lights[_animation] === undefined)
    res.status(400).send({ message: 'Bad inputs given (_animationName: ' + _animationName + ',_animation: ' + _animation + ')' })

  HomeState.lights[_animation] = _animationName

  res.status(200).send({ message: 'Success', lights: HomeState.lights })
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

app.post('/setLightsColor', async (req, res) => {

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



