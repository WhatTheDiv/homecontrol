const { spawn, exec } = require('child_process')

const getIndoorTempReading = async () => {
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

  }
  console.log('checkpoint')
  // runPythonScript('../dht22/humidity.py', [])

  await exec('ls && cd .. && cd dht22 && source env/bin/activate && python3 humidity.py', (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);
  })

  console.log('finished')




}

module.exports = { getIndoorTempReading }