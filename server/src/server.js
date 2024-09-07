// @ts-nocheck
const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000 //process.argv[2] === 'live' ? 3000 : 3001
const { handleButtonPress, getTvState, test } = require('./methods/tv-methods.js')
const { getIndoorTempReading } = require('./methods/gpio-methods.js')
const { DaemonClass } = require('./methods/Daemon')
const { irManager } = require('./methods/irManager-methods.js')
const audioManager = require('./methods/AudioManager.js')


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
    tvURL: 'http://192.168.10.109:8060',
    sources: {
      list: [
        { SourceName: 'Living Room', Id: 0 },
        { SourceName: 'Bedroom', Id: 1 }
      ],
      defaultSource: 0,
      defaultSourceType: 'last' /*        || 'favorite'          */
    }
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
  },
  ir: {
    services: [],
    commands: [
      // { name, command, source }
    ],
    lastCommand: {},
    sources: [
      "Audio Switch", "Tv", "Hdmi Switch"
    ]
  }

}

const Daemon = new DaemonClass()
const IrManager = new irManager({ ip: '192.168.2.116', port: 80 })
const AudioManager = new audioManager()

app.get('/initialState', async (req, res) => {
  // Get tv state // 
  HomeState.tv = { ...HomeState.tv, ... await getTvState(HomeState.tv) }

  // Get temp state // 
  await Daemon.sendCommand({ name: "temp_State", Daemon }).then(response => {
    const { err, message, temp } = response
    if (!err) {
      HomeState.temp = { ...HomeState.temp, indoor_humidity: temp.indoorHumidity, indoor_temp: temp.indoorTemp, updated: true }
    }
    else console.error(`Temp_State failed: ${message}`)
  })

  // Get lights state // 
  await Daemon.sendCommand({ name: 'lights_State', Daemon }).then(response => {
    const { lights, err } = response

    if (!err) {
      HomeState.lights.state.updated = true
      HomeState.lights.state.lights_active = lights.active

      const a = HomeState.lights.Animations
      HomeState.lights.state.animation = (Object.keys(a)).find(animName => a[animName] === lights.animation) || 'walk'
      HomeState.lights.state.animation_active = HomeState.lights.ActiveAnimations.indexOf(HomeState.lights.state.animation) >= 0 ? true : false
    } else {
      HomeState.lights.state.updated = false
    }
  })

  // Get audio state //
  // const passed_audio = await IrManager.sendCommand_audio({ command: 'getAudio' }).then(response => {
  //   const { success, fail, error, state } = response

  //   if (!success || fail) {
  //     HomeState.audio.zone_1.updated = false
  //     HomeState.audio.zone_2.updated = false

  //     console.error(`Audio state failed: ${error}`)
  //     return false
  //   }

  //   HomeState.audio.zone_1.updated = true
  //   HomeState.audio.zone_1.active = state.z1

  //   HomeState.audio.zone_2.updated = true
  //   HomeState.audio.zone_2.active = state.z2

  //   return true
  // })
  // Get audio state //
  await AudioManager.audioZone_updatetState({ IrManager })
  const audio = AudioManager.audio

  // format ir services
  const irServices = IrManager.services



  res.status(200).send({ ...HomeState, irServices, audio }).end();
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
  const { command } = req.body

  try {
    const ard = await fetch("http://192.168.2.116:80", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"
      },
      body: JSON.stringify(command)
    })


    res.send({ response: (await ard.text()).trim() }).end()

  } catch (e) {
    console.error('problem reaching host')
    console.log(e)
    res.sendStatus(502).end()
  }


})

app.post('/espAudio_set', async (req, res) => {
  const { zoneId, newState } = req.body

  const { success, error, errorMessage } = await AudioManager.audioZone_changeState({ zoneId, newState, IrManager })

  res.status(success ? 200 : 500).send({ success, audio: AudioManager.audio, errorMessage })

})

app.post('/espAudio_get', async (req, res) => {
  const { success, fail, error, state } = await IrManager.sendCommand_audio({ command: 'getAudio' })

  if (!success || fail) {
    HomeState.audio.zone_1.updated = false
    HomeState.audio.zone_2.updated = false

    return res.status(502).send({ success: false, error }).end()
  }

  HomeState.audio.zone_1.updated = true
  HomeState.audio.zone_1.active = state.z1

  HomeState.audio.zone_2.updated = true
  HomeState.audio.zone_2.active = state.z2

  res.status(200).send({ success: true, audio: HomeState.audio })

})

app.post('/epsIr_emit', async (req, res) => {
  const { source, commandName } = req.body

  const { success, error } = await IrManager.new_sendIrCommand({ commandName, source })

  if (!success) {
    return res.status(502).send({ success: false, error })
  }

  console.log(`Command (${commandName}) sent`)

  res.status(200).send({ success: true })
})

app.post('/epsIr_test', async (req, res) => {
  const { source, code } = req.body
  console.log('source at epsIr_test: ', source)
  const sourceId = HomeState.ir.sources.findIndex(item => item === source)

  const { success, fail, error } = await IrManager.testCommand({ source, code }, sourceId)

  if (fail) {
    console.error(`Failed to test IR code: ${error}`)
    return res.status(401).send({ success, error, command: { command: code, source }, commands: HomeState.ir.commands })
  }

  res.status(200).send({ success: true, command: { command: code, source }, commands: HomeState.ir.commands })
})

app.post('/epsIr_learn', async (req, res) => {
  const { source, commandName } = req.body

  console.group("Creating command")
  console.log({ commandName, source })

  if (source === undefined || commandName === undefined)
    return res.status(500).send({ success: false, error: "malformed request" })

  const index = (await IrManager.createCommand({ name: commandName, source, commands: HomeState.ir.commands })) - 1

  console.log('Index from create command: ', index)

  if (index < 0) {
    return res.status(502).send({ success: false, ir: HomeState.ir, error: `Error at server: command index ${index}` })
  }

  console.log("Command created: ", HomeState.ir.commands[index])
  console.log('All commands: ', HomeState.ir.commands)
  HomeState.ir.lastCommand = HomeState.ir.commands[index]

  console.groupEnd();

  res.status(200).send({ success: true, ir: HomeState.ir })


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

app.listen(port, async () => {
  Daemon.init.bind(Daemon)()
  await IrManager.activate.bind(IrManager)()
  await AudioManager.activate.bind(AudioManager)()

  console.log('Starting server on port [', port, '] ')
})



