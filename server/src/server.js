const express = require('express')
const cors = require('cors')
const app = express()
const port = process.argv[2] === 'live' ? 3000 : 3001
const { handleButtonPress, getTvState, test } = require('./methods/tv-methods.js')
const { getIndoorTempReading } = require('./methods/gpio-methods.js')
const { DaemonClass } = require('./methods/Daemon')

app.use(cors())
app.use(express.json())

const HomeState = {
  lights: {
    color_active: false,
    white_active: false,
    red: 236,
    green: 181,
    blue: 119
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
  }
}

const Daemon = new DaemonClass()

app.get('/initialState', async (req, res) => {
  HomeState.tv = { ...HomeState.tv, ... await getTvState(HomeState.tv) }
  const indoorState = await getIndoorTempReading()
  HomeState.temp.indoor_temp = indoorState.temp
  HomeState.temp.indoor_humidity = indoorState.humidity

  res.status(200).send({ ...HomeState })
})

app.get('/test', async (req, res) => {
  console.log('hitting tester')
  res.status(200).send({ success: true })
})



app.post('/toggleLightsActive', (req, res) => {
  const { mode, newState, action } = req.body

  console.log(action, ': ', { mode, newState })

  res.status(200).end()
})

app.post('/toggleAudioZones', async (req, res) => {
  const { zone, newState } = req.body

  if (!Daemon.active || !Daemon.process)
    return res.status(502).send({ message: 'Deamon inactive', success: false })

  const count = Daemon.count
  const { newCount, command, err, message } = Daemon.getCommand({ name: 'audio', zone, state: newState ? 1 : 0, count })

  if (err) return res.status(502).send({ message: 'Deamon returned fail: ' + message, success: false })

  Daemon.count = newCount
  Daemon.process.stdin.write(command)

  let pass = false
  let p = { success: false, failed: false }

  setTimeout(() => p.failed = true, Daemon.checkTimeout_seconds * 1000);

  while (!p.success && !p.failed) {
    p.success = await Daemon.check({ outputs: Daemon.outputs, count, duration: 250 })
    console.log('end of while: ', p)
  }
  console.log('cp')

  if (p.success) return res.status(200).send({ success: true }).end()

  console.log('not found')

  res.status(502).send({ message: 'Response from daemon not received', success: false }).end()








  // const { success, message, state } = await Daemon.({ zone, newState, Daemon, count:Daemon.inc(Daemon.count) })
  // if (success === false)
  //   res.status(502).send({ message })
  // else 
  //   res.status(200).send({ state })



})

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

