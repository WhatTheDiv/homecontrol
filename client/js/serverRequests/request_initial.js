// @ts-nocheck
import { updateWeather } from "../store/weather_slice";
import { setLoaded, setFailMessage } from '../store/ui_slice'
import { setRGB, lights_setInitial, lights_setDefaults } from "../store/lights_slice";
import { setActive, setName } from "../store/audio_slice";
import { setSource, setTvState } from '../store/tv_slice'
import { addCommands, setLastCommand, addSources, setServices_replace } from '../store/ir_slice'
import { f_err } from "../../assets/styles/globalStyles";

const loadDelay = 0

//XXX KEEP DEFAULTS UPDATED !!!
const DEFAULTS = {
  weather: {
    outdoorTemp: 0,
    outdoorHumidity: 0,
    forecast: {
      today: {
        high: 0,
        low: 0
      },
      tomorrow: {
        high: 0,
        low: 0
      }

    }
  },
  serverState: {
    lights: {
      rgbColor: { r: 112, g: 0, b: 0 },
      colorOn: false,
      whiteOn: false
    },
    temp: {
      indoorTemp: 0
    },
    tv: {
      power: true,
      input: 'chromecast',
      sources: {
        list: [],
        lastSource: 0,
        default: 'last'
      }
    },
    audio: {
      zone_1: {
        name: "Zone 1",
        active: true,
        updated: false
      },
      zone_2: {
        name: "Zone 2",
        active: true,
        updated: false
      }
    },
    ir: {
      commands: []
    }
  }
}

export default async function request_initial(dispatch) {
  return new Promise(async (res) => {
    setTimeout(async () => {
      try {

        const { outdoorTemp, outdoorHumidity, outdoorTemp_high, outdoorTemp_low, outdoorTemp_tomorrow_high, outdoorTemp_tomorrow_low, } = await getWeather()
        const { lights, temp, tv, audio, ir, irServices } = await getServerState({ timeout: 5000 })

        const { indoorTemp, indoorHumidity } = temp

        // throw new Error('test fail')
        // [ ] use redux default state instead of custom object

        dispatch(setTvState({ power: tv.power, input: tv.input }))
        dispatch(setSource({ sourceList: tv.sources.list, defaultSource: tv.sources.defaultSource, defaultSourceType: tv.sources.defaultSourceType }))
        dispatch(setActive({ zone1_active: audio.zone_1.active, zone2_active: audio.zone_2.active, zone1_updated: audio.zone_1.updated, zone2_updated: audio.zone_2.updated }))
        dispatch(setName({ zone1_newName: audio.zone_1.name, zone2_newName: audio.zone_2.name }))
        dispatch(updateWeather({ outdoorTemp, outdoorHumidity, indoorTemp, indoorHumidity, outdoorTemp_high, outdoorTemp_low, outdoorTemp_tomorrow_high, outdoorTemp_tomorrow_low }))
        dispatch(addCommands({ commands: [...ir.commands] }))
        dispatch(addSources({ sources: [...ir.sources] }))
        dispatch(setServices_replace({ services: [...irServices] }))
        dispatch(setLastCommand({ lastCommand: ir.lastCommand }))
        dispatch(lights_setInitial({ ...lights }))
        dispatch(lights_setDefaults({
          defaultAnimation: lights.defaultAnimation,
          defaultOnAnimation: lights.defaultOnAnimation,
          defaultOffAnimation: lights.defaultOffAnimation,
        }))
        dispatch(setLoaded(true))
        res(true)

      } catch (e) {
        //XXX KEEP DEFAULTS UPDATED !!!
        console.log('error: ', e)
        dispatch(setFailMessage(e.message))
        res(false)
      }



      // base function return true or false ONLY 
      // dispatch required: 
      // - setLoaded = true 
    }, loadDelay);
  })
}

export async function request_periodic() {

}

const getWeather = async () => {



  const locationCode = 2083757
  const weatherapiurl = "http://dataservice.accuweather.com"

  if (process.env.EXPO_PUBLIC_WEATHER_API_KEY === 'false') {
    console.log('Not bothering Weather with a request ... ')
    return DEFAULTS.weather
  }
  if (process.env.EXPO_PUBLIC_WEATHER_API_KEY.length <= 0) {
    console.error('Problem with weather API key')
  }
  else console.log(`Getting weather data from ${process.env.EXPO_PUBLIC_WEATHER_API_URL}/forecasts/v1/daily/5day/${locationCode}?apikey=${process.env.EXPO_PUBLIC_WEATHER_API_KEY}&details=true&metric=false`)

  const getCurrentTemperature = new Promise(async res => {
    try {
      console.log('Getting current temperature')
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_WEATHER_API_URL}/currentconditions/v1/${locationCode}?apikey=${process.env.EXPO_PUBLIC_WEATHER_API_KEY}&details=true`
      )

      if (response && !response.ok) {
        const r = await response.json()
        throw new Error('API HTTP Code:' + response.status + ', ' + r.Message)
      }

      const d = await response.json()

      const data = d[0]

      res({ temp: data.Temperature.Imperial.Value, humidity: data.RelativeHumidity })

    } catch (e) {
      console.error('Failed to get current temp')
      console.error(e)
      res({ temp: DEFAULTS.weather.outdoorTemp, humidity: DEFAULTS.weather.outdoorHumidity })
    }
  })
  const getForecast = new Promise(async res => {
    try {

      console.log('Getting forecast')

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_WEATHER_API_URL}/forecasts/v1/daily/5day/${locationCode}?apikey=${process.env.EXPO_PUBLIC_WEATHER_API_KEY}&details=true&metric=false`
      )

      if (response && !response.ok) {
        const r = await response.json()
        throw new Error('API HTTP Code:' + response.status + ', ' + r.Message)
      }

      const d = await response.json()
      const today = d.DailyForecasts[0]
      const tomorrow = d.DailyForecasts[1]

      const f = {
        today: {
          high: today.Temperature.Maximum.Value || DEFAULTS.weather.forecast.today.high,
          low: today.Temperature.Minimum.Value || DEFAULTS.weather.forecast.today.low
        },
        tomorrow: {
          high: tomorrow.Temperature.Maximum.Value || DEFAULTS.weather.forecast.tomorrow.high,
          low: tomorrow.Temperature.Minimum.Value || DEFAULTS.weather.forecast.tomorrow.low
        }
      }

      res(f)

    } catch (e) {
      console.error('Failed to get forecast')
      console.error(e)
      res(DEFAULTS.weather.forecast)
    }
  })




  const [currentTemperature, forecast] = await Promise.all([getCurrentTemperature, getForecast])
  const { today, tomorrow } = forecast

  const data = {
    outdoorTemp: currentTemperature.temp,
    outdoorHumidity: currentTemperature.humidity,
    outdoorTemp_high: today.high,
    outdoorTemp_low: today.low,
    outdoorTemp_tomorrow_high: tomorrow.high,
    outdoorTemp_tomorrow_low: tomorrow.low,
  }

  console.log('Weather Data: ', data)

  return data

}


const getServerState = async ({ timeout = 7000 }) => {

  try {

    if (process.env.EXPO_PUBLIC_SERVER_URL.length <= 0)
      throw new Error('No server url')

    const url = `${process.env.EXPO_PUBLIC_SERVER_URL}/initialState`

    console.log('Getting server data from ...', process.env.EXPO_PUBLIC_SERVER_URL)

    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url, {
      timeout, signal: controller.signal
    })
    clearTimeout(id)

    if (!response.ok) {
      console.error('Server response not OK')
      return DEFAULTS.serverState
    }

    const { lights, temp, tv, audio, ir, irServices } = await response.json()


    return {
      lights: {
        lightsOn: lights.state?.lights_active,
        animation: lights.state?.animation,
        updated: lights.state.updated,
        rgbColor: { r: lights.red, g: lights.green, b: lights.blue },
        colorOn: lights.color_active,
        whiteOn: lights.white_active,
        Animations: lights.Animations,
        ActiveAnimations: lights.ActiveAnimations,
        defaultAnimation: lights.defaultAnimation,
        defaultOnAnimation: lights.defaultOnAnimation,
        defaultOffAnimation: lights.defaultOffAnimation,
        Zones: lights.Zones,
      },
      temp: {
        indoorTemp: temp.indoor_temp,
        indoorHumidity: temp.indoor_humidity
      },
      tv: {
        power: tv.power,
        input: tv.input,
        sources: tv.sources
      },
      audio,
      ir,
      irServices
    }
  } catch (error) {
    console.log('Failed to hit server - ', error.message)
    return DEFAULTS.serverState
  }




}


