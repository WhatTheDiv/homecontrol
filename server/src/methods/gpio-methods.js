
const { exec } = require('child_process')

const getIndoorTempReading = async () => {
  return await new Promise(async (res, rej) => {
    let returned = false
    const returnObj = {
      temp: 99,
      humidity: 99
    }

    try {
      const childProcess = await exec('cd src/dht22 && python3 humidity.py', (error, stdout, stderr) => {
        if (error) {
          console.error('Error in process, server temp reading: ', stderr)
          throw new Error("Error in process, server temp reading: " + error)
        }
        if (stderr) {
          console.error('Temperature read created error: ', stderr)
          throw new Error("Sensor error: " + stdout)
        }
        if (stdout.indexOf('Temp:') === -1) {
          console.error('Bad temperature response from server: ', stdout)
          throw new Error("Sensor failed: " + stdout)
        }

        const temp = Number(stdout.slice(stdout.indexOf("Temp:") + 5, stdout.indexOf('F')))
        const humidity = Number(stdout.slice(stdout.indexOf('Humidity:') + 9, stdout.indexOf('%')))

        console.log('Got temp and humidity', { temp, humidity })
        returnObj.temp = temp
        returnObj.humidity = humidity

      })

      childProcess.on('error', (error) => {
        console.log('process: error', error)
        throw new Error('Error code from child process: ' + error)
      })
      childProcess.on('close', (code) => {
        console.log('Closing process with code: ', code)
        if (returned) return
        returned = true
        res(returnObj)
      })

    } catch (e) {
      console.log('Failed to contact sensor')
      if (returned) return
      returned = true
      res(returnObj)
    }
  })
}

module.exports = { getIndoorTempReading }