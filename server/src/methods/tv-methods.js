// @ts-nocheck

const handleButtonPress = async (button, { power, inputs, menuInput }, tv) => {
  const getInputObject = (name) => {
    for (const input of inputs)
      if (((input.name).toLowerCase()).indexOf(name) >= 0)
        return input
    return false
  }
  const response = { button, success: true }
  let route = 'keypress/'

  switch (button) {
    case 'power':
      response.setting = 'power'
      response.newState = !power
      route += response.newState ? 'power' : 'PowerOff'
      break;
    case 'shortcut-plex':
    case 'shortcut-xbox':
    case 'shortcut-chromecast':
      response.setting = 'input'
      response.newState = getInputObject(button.slice(button.indexOf('-') + 1))
      route = 'launch/' + response.newState.id
      console.log('route ::: ', route)
      break;
    case 'home':
      response.setting = 'input'
      response.newState = menuInput
      route = route + 'Home'
      break;
    case 'left':
      route += 'Left'
      break;
    case 'right':
      route += 'Right'
      break;
    case 'down':
      route += 'Down'
      break;
    case 'up':
      route += 'Up'
      break;
    case 'select':
      route += 'Select'
      break;
    case 'back':
      route += 'Back'
      break;
    case 'volDown':
      route += 'VolumeDown'
      break;
    case 'volUp':
      route += 'VolumeUp'
      break;
    case 'mute':
      route += 'VolumeMute'
      break;
  }

  try {
    if (route === undefined || !route) throw new Error('No matching buttons')

    const url = `${tv}/${route}`
    const options = {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }
    const result = await fetch(url, options)

    console.log('tv response: ', {
      responseStatus: result.status,
    })

    if (result?.status !== 200)
      throw new Error('Could not communicate with TV')

  } catch (error) {
    response.success = false
    response.errorMessage = error.message
  }
  return response
  //           return:                           return: 
  //           { button, success }       -- OR --         { button, setting, newState, success }
}

const getTvState = async ({ tvURL, menuInput }) => {
  const getPowerStatus = new Promise(async (res, rej) => {
    const route = 'query/device-info'
    const url = `${tvURL}/${route}`
    const options = {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'GET'
    }

    try {

      const result = await fetch(url, options)

      if (result.status !== 200)
        throw new Error('Bad response from TV (Code:' + result.status + ' )')

      const val = await new Response(result.body).text()

      const powerOn = val.slice(val.indexOf("<power-mode>") + 12, val.indexOf("</power-mode>")) === 'PowerOn' ? true : false

      res(powerOn)

    } catch (e) {
      console.log('Error getting TV power state: ', e.message)
      res(false)
    }


  })
  const getInputs = new Promise(async (res, rej) => {
    const route = 'query/apps'
    const url = `${tvURL}/${route}`
    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET'
    }

    try {

      const result = await fetch(url, options)

      if (result.status !== 200)
        throw new Error('Bad response from TV (Code:' + result.status + ' )')

      const val = await new Response(result.body).text()

      const rows = []
      const inps = []

      let more = true
      let endPoint = val.indexOf('</app>') + 6
      let count = 0

      rows.push(val.slice(val.indexOf('<app '), endPoint))
      if (val.indexOf('<app', endPoint) < 0) more = false
      count++

      while (more) {
        const startPoint = endPoint
        endPoint = val.indexOf('</app', endPoint) + 6
        const row = val.slice(val.indexOf('<app', startPoint), endPoint)
        rows.push(row)
        if (val.indexOf('<app', endPoint) < 0) more = false
        if (count++ > 10) more = false

      }

      console.log('Got', rows.length, 'inputs from tv')

      for (const row of rows) {
        let start = row.indexOf('id') + 4
        const id = row.slice(start, row.indexOf('"', start))
        start = row.indexOf('"', row.indexOf('version') + 9) + 2
        const name = row.slice(start, row.indexOf('</app>', start))
        inps.push({ id, name })
      }

      res(inps)

    } catch (e) {
      console.log('Error getting inputs: ', e.message)
      res([])
    }
  })
  const getCurrentPlayer = new Promise(async (res) => {
    const route = 'query/media-player'
    const url = `${tvURL}/${route}`
    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET'
    }

    try {
      const result = await fetch(url, options)

      if (result.status !== 200)
        throw new Error('Bad response from TV (Code:' + result.status + ' )')

      const val = await new Response(result.body).text()

      const index_id = val.indexOf('id')

      if (index_id < 0)
        res({ id: 'null', name: 'null' })

      let start = index_id + 4
      let endPoint = val.indexOf('"', start)


      const id = val.slice(start, endPoint)

      start = val.indexOf('name=', endPoint) + 6
      endPoint = val.indexOf('"', start)

      const name = val.slice(start, endPoint)

      res({ id, name })

    } catch (e) {
      console.log('Error getting player: ', e.message)
      res({ id: 'null', name: 'null' })
    }
  })

  const [power, inputs, input] = await Promise.all([getPowerStatus, getInputs, getCurrentPlayer])
  const updates = { power, inputs }

  if (input.id !== 'null')
    updates.input = input

  if (menuInput.id === 'null' && ((input?.name).toLowerCase()).indexOf('menu') >= 0)
    updates.menuInput = input

  console.log('returning updates: ', { power, input })
  return updates
}

const test = async (tv) => {

  const route = 'query/device-info'
  const url = `${tv}/${route}`

  console.log('.')
  console.log('.')
  console.log('.')
  console.log('url: ', url)


  const options = {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'GET'
  }

  try {

    const result = await fetch(url, options)

    console.log('result: ', result.status)

    if (result.status !== 200)
      return

    const val = await new Response(result.body).text()

    console.log(val)


    return

  } catch (e) {
    console.log('Error with request: ', e.message)
    return
  }
}


module.exports = { handleButtonPress, getTvState, test }