import { router } from "expo-router";
import { setFailMessage } from "../store/ui_slice";

export default async function request_tv(button, dispatch) {
  // this function handles all errors async, returns only true or false when complete
  return await new Promise(async (res) => {

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        button
      })
    }

    try {
      const url = `${process.env.EXPO_PUBLIC_SERVER_URL}/remote`
      const response = await fetch(url, options).catch(async e => {
        console.log('failed to hit server, trying basic')
        await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/test`).then(res => {
          const result = res.json()
          console.log('backup result: ', result)
        })
        throw new Error('resorted to backup server request to validate existance')

      })


      if (!response.ok) {
        console.error('Server response not OK')
        res(false)
      }


      res(await response.json())

    } catch (e) {
      dispatch(setFailMessage(e.message))
      router.replace('/fallback')
      console.error('Error sending server request --->', e.message)
      console.warn(e)
      res(false)
    }
  })
}