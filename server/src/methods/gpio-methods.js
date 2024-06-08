const { spawn } = require('child_process')

const getIndoorTempReading = () => {
  const runPythonScript = (scriptPath, args) => {
    const pyProg = spawn('python', [scriptPath].concat(args))

    let data = ''
    pyProg.stdout.on('data', (stdout) => {
      data += stdout.toString()
    })

    pyProg.stderr.on('data', (stderr) => {
      console.log('stderr: ', stderr)
    })

    pyProg.on('close', (code) => {
      console.log('child process exited with code', code)
      console.log(data)
    })

    runPythonScript('../dht22/humidity.py', [])
  }
  console.log('checkpoint')




}

module.exports = { getIndoorTempReading }