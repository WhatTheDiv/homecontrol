
const { exec } = require('child_process')

const getIndoorTempReading = async () => {
  return await new Promise(async (res, rej) => {
    let returned = false
    const returnObj = {
      temp: 999,
      humidity: 999
    }

    try {
      const childProcess = await exec('cd src/python && env/bin/python3 scripts/humidity.py', (error, stdout, stderr) => {

        if (error) {
          console.error('Error in process, server temp reading: ', stderr)
          throw new Error("Error in process, server temp reading: " + error)
        }
        else if (stderr) {
          console.error('Temperature read created error: ', stderr)
          throw new Error("Sensor error: " + stdout)
        }
        else if (stdout.indexOf('Temp:') === -1) {
          console.error('Bad temperature response from server: ', stdout)
          res(returnObj)
        }
        else {
          const temp = Number(stdout.slice(stdout.indexOf("Temp:") + 5, stdout.indexOf('F')))
          const humidity = Number(stdout.slice(stdout.indexOf('Humidity:') + 9, stdout.indexOf('%')))

          console.log('Got temp and humidity', { temp, humidity })
          returnObj.temp = temp
          returnObj.humidity = humidity
        }


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

const testLeds = async () => {
  return await new Promise(async (res, rej) => {

    let returned = false


    try {
      const childProcess = await exec('cd src/python && env/bin/python3 neopixel.py', (error, stdout, stderr) => {
        if (error) {
          console.error("testLED's, error before child process:", error)
          throw new Error("testLED's, error before child process:" + error)
        }
        if (stderr) {
          console.error("testLED's, child process spawned error:", stderr)
          throw new Error("testLED's, child process spawned error:" + stderr)
        }

        console.log("Got stdout in testLED's: ", stdout);
        returned = true
        res(true)

      })

      childProcess.on('error', (error) => {
        console.error("testLED's, error before child process #2:", error)
        throw new Error("testLED's, error before child process #2:" + error)
      })
      childProcess.on('close', (code) => {
        console.log('Closing process with code: ', code)
        if (returned) return
        returned = true
        res(true)
      })

    } catch (e) {
      console.log('Failed while running neopixel.py')
      if (returned) return
      returned = true
      res(false)
    }



  })
}

const initGPIO = async (Daemon) => {
  // return new Promise((res, rej) => {


  // })
  try {
    const { spawn } = require('child_process')

    // const process = spawn('cd src/python && env/bin/python3 scripts/audioRelays.py', ['2', 'True'], { detached: true })
    const process = spawn('ls', [])
    console.log(' spawned fork')

    Daemon.process = process
    Daemon.active = true

    process.on('disconnect', (data) => {
      console.log(`--- disconnected: ${data}`);
    });

    process.on('error', (e) => {
      // throw new Error(`stderr: ${data}`);
      console.log('--- errored: ', e)
    });

    process.on('close', (code) => {
      console.log(`--- closed: code ${code}`);
    });

    process.on('message', (data) => {
      console.log(`--- messaged: ${data}`);
    });

    process.stdout.on('data', data => {
      console.log('--- stdout data: ', data)
    })

    process.stdin.on('data', data => {
      console.log('--- stdin data: ', JSON.parse(data))
    })

    process.stderr.on('data', e => {
      console.log('--- stderr: ', e)
    })

  } catch (e) {
    console.error('Error in child process: ', e)
    Daemon.active = false
    console.log('Exiting Daemon')
  }

}

module.exports = { getIndoorTempReading, testLeds, initGPIO }