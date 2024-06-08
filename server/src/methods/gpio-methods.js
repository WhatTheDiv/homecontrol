const util = require('util')
const exec = util.promisify(require('child_process').exec)
const controller = new AbortController()
const { signal } = controller

const getIndoorTempReading = async () => {
  try {
    const { stdout, stderr } = await exec('cd src/dht22 && python3 humidity.py', { signal })

    console.log('stdout: ', stdout)
    if (stderr) throw new Error('stderr: ' + stderr)
    if (stdout.indexOf('Temp:') === -1)
      throw new Error("Sensor fail: " + stdout)

    const temp = Number(stdout.slice(stdout.indexOf("Temp:") + 5, stdout.indexOf('F')))
    const humidity = Number(stdout.slice(stdout.indexOf('Humidity:') + 9, stdout.indexOf('%')))

    console.log({
      temp, humidity
    })
    return {
      temp, humidity
    }

  } catch (e) {
    console.log('failed to contact sensor')
    return {
      temp: 99,
      humidity: 99
    }
  }

}

module.exports = { getIndoorTempReading }