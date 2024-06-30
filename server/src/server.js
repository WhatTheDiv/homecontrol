const express = require('express')
const cors = require('cors')
const app = express()
const port = process.argv[2] === 'live' ? 3000 : 3001
const { handleButtonPress, getTvState, test } = require('./methods/tv-methods.js')
const { getIndoorTempReading, initGPIO } = require('./methods/gpio-methods.js')

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

const Daemon = {
  active: false,
  // process: async () => {}
}

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
  initGPIO(Daemon)
  console.log('Starting server on port [', port, '] ')
})

