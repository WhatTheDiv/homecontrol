export default async function request_audio({ zone, newState }) {
  try {

    console.log('request audio ------')

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ zone, newState })
    }
    console.log('server url: ', process.env.EXPO_PUBLIC_SERVER_URL)
    const url = `${process.env.EXPO_PUBLIC_SERVER_URL}/espAudio_set`
    const result = await fetch(url, options)
    console.log('result: ', result)
    const parsed = await result.json()
    console.log('parsed: ', parsed)

    if (result.status !== 200)
      throw new Error(`Error code ${result.status}: ${parsed.message}`)
    else
      return true


  } catch (e) {
    console.log('caught error at request_audio fetch')
    console.error(e)
    return false
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