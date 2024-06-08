
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
        if (stdout.indexOf('Temp:') === -1) throw new Error("Sensor failed: " + stdout)

        const temp = Number(stdout.slice(stdout.indexOf("Temp:") + 5, stdout.indexOf('F')))
        const humidity = Number(stdout.slice(stdout.indexOf('Humidity:') + 9, stdout.indexOf('%')))

        console.log('modifying returnObj', { temp, humidity })
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