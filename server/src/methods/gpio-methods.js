// const util = require('util')
// const exec = util.promisify(require('child_process').exec)
// const controller = new AbortController()
// const { signal } = controller

// const getIndoorTempReading = async () => {
//   const returnObj = {
//     temp: 99,
//     humidity: 99
//   }
//   try {
//     const { stdout, stderr } = await exec('cd src/dht22 && python3 humidity.py', { signal } )

//     console.log('stdout: ', stdout)
//     if (stderr) throw new Error('stderr: ' + stderr)
//     if (stdout.indexOf('Temp:') === -1)
//       throw new Error("Sensor fail: " + stdout)

//     const temp = Number(stdout.slice(stdout.indexOf("Temp:") + 5, stdout.indexOf('F')))
//     const humidity = Number(stdout.slice(stdout.indexOf('Humidity:') + 9, stdout.indexOf('%')))

//     returnObj.temp = temp
//     returnObj.humidity = humidity

//     controller.abort()
//     console.log('controller aborted')

//   } catch (e) {
//     console.log('failed to contact sensor')
//   }

//   return returnObj

// }
const { exec } = require('child_process')

const getIndoorTempReading = async () => {
  const returnObj = {
    temp: 99,
    humidity: 99
  }
  try {
    const childProcess = await exec('cd src/dht22 && python3 humidity.py')

    /*
    , (error, stdout, stderr) => {

      if (error) throw new Error('There was an error in exec: '+error)
      if (stderr) throw new Error('stderr: ' + stderr)
      if (stdout.indexOf('Temp:') === -1) throw new Error("Sensor failed: " + stdout)

      const temp = Number(stdout.slice(stdout.indexOf("Temp:") + 5, stdout.indexOf('F')))
      const humidity = Number(stdout.slice(stdout.indexOf('Humidity:') + 9, stdout.indexOf('%')))

      returnObj.temp = temp
      returnObj.humidity = humidity

    }
     */

    childProcess.on('data', (stdout) => {
      console.log('process: data', stdout)
    })
    childProcess.on('close', (code) => {
      console.log('process: close', code)
    })
    childProcess.on('exit', (code) => {
      console.log('process: exit', code)
    })



  } catch (e) {
    console.log('Failed to contact sensor')
  }

  return returnObj

}

module.exports = { getIndoorTempReading }