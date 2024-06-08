const { exec } = require('child_process')

const getIndoorTempReading = async () => {
  return new Promise((res, rej) => {
    exec('cd src/dht22 && python3 humidity.py', (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        res({ temp: 99, humidity: 99 })
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        res({ temp: 99, humidity: 99 })
      }
      else {
        console.log(`stdout: ${stdout}`);
        const temp = stdout.slice(stdout.indexOf("Temp:" + 5), stdout.indexOf('F'))
        const humidity = stdout.slice(stdout.indexOf('Humidity:' + 9), stdout.indexOf('%'))
        console.log({
          temp, humidity
        })
        res({ temp, humidity })
      }
    })
  })
}

module.exports = { getIndoorTempReading }