// @ts-nocheck
import {
  lights_setInitial,
  lights_setDefaults
} from "../store/lights_slice";

export default async function request_lights({ action, newState, animationName, colorLabel, rgbw, dispatch }) {
  return await new Promise(async (res) => {
    const body = {}
    let url = `${process.env.EXPO_PUBLIC_SERVER_URL}`

    switch (action) {
      case 'toggleLightsActive':
        if (newState === undefined)
          throw Error(`Stopped request, bad input [newState:${newState}]`)
        body.newState = newState
        url += '/toggleLightsActive'
        break;

      case 'setColor':
        if (!colorLabel || !rgbw)
          throw Error(`Stopped request, bad input [colorLabel:${colorLabel}, rgbw:${rgbw}]`)

        body.mode = 'color'
        body.name = colorLabel
        body.value = rgbw
        url += '/setLightsColor'
        break;

      case 'setAnimation':
        if (!animationName)
          throw Error(`Stopped request, bad input [animationName:${animationName}]`)

        body._animationName = animationName
        url += '/setLightsAnimation'
        break;

      case 'changeDefaultAnimation':
        body._animationName = animationName
        body._animation = newState
        url += '/updateDefaultAnimations'
        console.log('changing default animations: type - ', body._animationName, ', name - ', body._animation)
        break;
      default:
        alert('Problem, request_lights default case, returning false')
        throw Error(`Bad action given to request_lights.js`, {}, 'request_lights.js')
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }

    try {
      const response = await fetch(url, options)
      if (response.status === 404) throw new Error(`Server cannot be reached or is offline (${response.status})`)

      const data = await response.json()
      if (response.status !== 200) throw Error(`Server responded with (${response.status}) '${data.message}'`, 'request_lights.js')


      console.log(action, ' response', response.status, ' - ', data.message)


      switch (action) {
        case 'changeDefaultAnimation':
          dispatch(
            lights_setDefaults({
              [newState]: animationName
            })
          );
          break;
        case 'toggleLightsActive':
        case 'setAnimation':
        default:
          dispatch(
            lights_setInitial({
              animation_active: data.state.animation_active,
              lightsOn: data.state.lights_active,
              animation: data.state.animation,
              updated: true,
            })
          );
          break;
      }

      res(data)

    } catch (e) {
      console.error('Error contacting server for lights: ' + e.message)

      switch (action) {
        case 'changeDefaultAnimation':
          break;
        case 'toggleLightsActive':
        case 'setAnimation':
        default:
          dispatch(lights_setInitial({ updated: false }));
          break;
      }
      res(false)
    }
  })
}
