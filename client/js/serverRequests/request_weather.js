
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

