class DaemonClass {
  constructor() {
    this.active = false
    this.process = null
    this.outputs = []
    this.count = 0
    this.maxCount = 10
    this.checkTimeout_seconds = 6000
  }

  init = async () => {
    const controller = new AbortController()

    try {
      const { spawn } = require('child_process')
      const process = spawn('python3 ./scripts/audioRelays.py', [], { cwd: './src/python', shell: true, signal: controller.signal })



      // process.stdin.write('hello from node! \n')

      process.on('disconnect', (data) => {
        console.log(`--- disconnected: ${data}`);
        controller.abort()
        this.process = null
        this.active = false
      });

      process.on('error', (e) => {
        // throw new Error(`stderr: ${data}`);
        console.log('--- errored: ', e)
        controller.abort()
        this.process = null
        this.active = false
      });

      process.on('close', (code) => {
        console.log(`--- closed: code ${code}`);
        controller.abort()
        this.process = null
        this.active = false
      });

      process.stdout.on('data', data => {
        const d = data.toString()
        console.log('*', d)
        this.outputs.push(d)

        if (this.outputs.length > this.maxCount) this.outputs.splice(0, 1)
      })

      process.stdin.on('data', data => {
        console.log('--- stdin data: ', data)
      })

      process.stderr.on('data', e => {
        console.log('--- stderr: ', e.toString())
        controller.abort()
        this.process = null
        this.active = false
      })

      this.process = process
      this.active = true

    } catch (e) {
      console.error('Error in child process: ', e)
      this.process = null
      this.active = false
      console.log('Exiting Daemon')
      controller.abort()
    }
  }

  inc = (count) => {
    if (count > this.maxCount) return 0
    else if (count <= this.maxCount) return count += 1
  }

  getCommand = ({ name, zone = -1, state = 0, count }) => {
    if (!this.process)
      return { err: true, message: 'Daemon is dead' }

    const obj = { count }

    switch (name) {
      case 'audio':
        obj.name = 'a'
        obj.cmd = 'z' + zone + '-' + state

    }
    // 1:a/z1-0       =     [ count : name / command ]

    return { newCount: this.inc(count), command: `${obj.count}:${obj.name}/${obj.cmd}\n` }
  }

  check = async ({ outputs, count, duration }) => {
    return await new Promise((res) => {

      setTimeout(() => res(false), duration);

      console.log('checking outputs: ', outputs)

      for (const output of outputs)
        if (Number(output.slice(0, output.indexOf(':'))) === count)
          res(true)
    })
  }
}

module.exports = { DaemonClass }

