
export async function requestWeather_updateFeels({ newValue, feels_setting, feels_value }) {
  const status = { success: false, serverErrorMessage: '' }

  try {
    const url = `${process.env.EXPO_PUBLIC_SERVER_URL}/setFeels`
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newValue, feels_setting, feels_value })
    }

    const result = await fetch(url, options)

    if (result.status === 404)
      throw new Error(`Failed to reach server`)

    const { success, feels, serverErrorMessage } = await result.json()

    if (!success)
      throw new Error(`Server responded with ${result.status} - ${serverErrorMessage}`)

    status.success = true
    status.feels = feels


  } catch (e) {
    status.success = false
    status.serverErrorMessage = e.message

  } finally {
    return status
  }
}

export async function requestWeather_getWeather() {

  const locationCode = 2083757

  if (process.env.EXPO_PUBLIC_WEATHER_API_KEY === 'false' || !process.env.EXPO_PUBLIC_WEATHER_API_KEY)
    throw new Error('Not bothering weather with request.')

  if (process.env.EXPO_PUBLIC_WEATHER_API_KEY.length <= 0)
    throw new Error('Problem with weather API key')

  const getCurrentTemperature = new Promise(async (res, rej) => {
    try {
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
      rej(`Error getting current weather: ${e.message}`)
    }
  })
  const getForecast = new Promise(async (res, rej) => {
    try {

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
          high: today.Temperature.Maximum.Value,
          low: today.Temperature.Minimum.Value,
        },
        tomorrow: {
          high: tomorrow.Temperature.Maximum.Value,
          low: tomorrow.Temperature.Minimum.Value
        }
      }

      res(f)

    } catch (e) {
      rej(`Error getting forecast: ${e.message}`)
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

  return data

}

