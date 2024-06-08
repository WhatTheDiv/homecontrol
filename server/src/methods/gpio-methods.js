const { exec } = require('child_process')

const getIndoorTempReading = async () => {
  return new Promise((res, rej) => {
    exec('cd src/dht22 && python3 humidity.py', (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
      }
      else {
        console.log(`stdout: ${stdout}`);
        // const temp = stdout.slice(stdout.indexOf("Temp:" + 5), stdout.indexOf('F'))
        // const humidity = stdout.slice(stdout.indexOf('Humidity:' + 9), stdout.indexOf('%'))
        // console.log({
        //   temp, humidity
        // })
        return
      }
    })
  })
}

module.exports = { getIndoorTempReading }