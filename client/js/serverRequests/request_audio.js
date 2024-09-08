export default async function request_audio({ zoneId, newState }) {
  const status = { success: false, errorMessage: '', audio: {} }
  try {

    const url = `${process.env.EXPO_PUBLIC_SERVER_URL}/espAudio_set`
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ zoneId, newState })
    }

    const result = await fetch(url, options)

    if (result.status === 404)
      throw new Error(`Failed to reach server`)

    const { audio, errorMessage } = await result.json()

    if (result.status !== 200)
      throw new Error(`Server responded with fail code ${result.status} (${errorMessage})`)

    status.success = true
    status.audio = audio

  } catch (e) {
    status.errorMessage = `(RequestAudio) Failed to change audio state (${e.message})`
    console.log(status.errorMessage)
    console.error(e)

  } finally {

    console.log("Returning from RequestAudio: ", status.audio)
    return status

  }
}

export async function change_zone_name({ newName, zone }) {
  try {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ zone, newName })
    }
    console.log(options)
    const url = `${process.env.EXPO_PUBLIC_SERVER_URL}/setZoneName`
    const result = await fetch(url, options)
    console.log('Fetch status:', result.status)

    if (result.status !== 200) {
      const { message } = await result.json()
      throw new Error(`Error code ${result.status}: ${message}`)
    }
    else return true

  } catch (e) {
    console.log('Caught error at change_zone_name')
    console.error(e)
    return false
  }
}

export async function changeAudioSource({ sourceName }) {
  const status = { success: false, errorMessage: '' }

  try {
    if (sourceName === undefined)
      throw new Error('No source given')

    const url = `${process.env.EXPO_PUBLIC_SERVER_URL}/espSource_set`
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sourceName })
    }

    const result = await fetch(url, options)

    if (result.status === 404)
      throw new Error(`Failed to reach server`)

    const { success, errorMessage } = await result.json()

    if (result.status !== 200)
      throw new Error(`Server responded with fail code ${result.status} (${errorMessage})`)

    status.success = true

  } catch (e) {
    status.errorMessage = `(RequestAudio) Failed to change audio source (${e.message})`
    console.log(status.errorMessage)
  } finally {

    return status

  }
}