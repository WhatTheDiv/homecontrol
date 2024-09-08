// @ts-nocheck
const fs = require('node:fs/promises');

class audioManager {
  constructor() {
    this.audio = {
      zones: [],
      sources: [],
      lastSourceSelected_id: 1,
      active: true
    }
  }

  // returns { av:this, success, errorMessage }
  async activate({ AudioZones, AudioSources }) {
    if (AudioZones !== undefined)
      this.audio.zones = AudioZones

    if (AudioSources !== undefined)
      this.audio.sources = AudioSources
  }

  // returns { success, error, errorMessage }
  async audioZone_changeState({ zoneId, newState, IrManager }) {
    const status = { success: false, error: false, errorMessage: '' }
    const zone = this.audio.zones.find(zone => zone.id === zoneId)

    try {
      if (!IrManager.isAlive)
        throw new Error(`IrManager is not alive`)
      else if (zone === undefined)
        throw new Error(`Zone not available`)

      const { success, error, errorMessage } = await IrManager.new_sendCommand_audio({ command: 'setAudio', state: newState, zone: zone.zone })

      if (error)
        throw new Error(errorMessage)

      zone.active = newState
      zone.updated = true
      status.success = true

    } catch (e) {
      zone.updated = false

      status.error = true
      status.errorMessage`---> Failed to set audio zone (${e.message})`
      console.error(status.errorMessage)

    } finally {
      this.audio.zones[this.audio.zones.findIndex(zone => zone.id === zoneId)] = zone
      return status

    }
  }

  // returns { success, error, errorMessage }
  async audioZone_updatetState({ IrManager }) {
    const status = { success: false, state: {}, error: false, errorMessage: '' }
    const zones = this.audio.zones.map(item => item)

    try {
      if (!IrManager.isAlive)
        throw new Error(`IrManager is not alive`)

      const { success, zoneNumber_state, error, errorMessage } = await IrManager.new_sendCommand_audio({ command: 'getAudio' })

      if (error)
        throw new Error(errorMessage)

      zones.forEach((zone, index) => {
        const state = zoneNumber_state[zone.zone]
        if (state !== undefined) {
          zone.active = state
          zone.updated = true
        }
      })

      status.success = true

    } catch (e) {
      zones.forEach((zone, index) => zone.updated = false)

      status.error = true
      status.errorMessage = `---> Failed to get audio state (${e.message})`
      console.error(status.errorMessage)

    } finally {
      this.audio.zones = zones
      return status
    }
  }

  async audioSource_togglePower({ IrManager, newState }) {
    const status = { success: false, error: false, errorMessage: '' }
    const powerState = this.audio.active

    try {
      if (!IrManager.isAlive)
        throw new Error(`IrManager is not alive`)

      else if (powerState === newState)
        throw new Error(`Client out of sync, power currently (${powerState ? 'ON' : 'OFF'})`)

      const { success, error } = await IrManager.new_sendIrCommand({ commandName: 'Power', source: 'Audio Switch' })

      if (!success)
        throw new Error(error)

      this.audio.active = newState

    } catch (e) {

      status.error = true
      status.errorMessage`---> Failed to toggle audio power (${e.message})`
      console.error(status.errorMessage)

    } finally {
      return status
    }
  }

  async audioSource_adjustPowerOutOfSync() {
    this.audio.active = !this.audio.active
    return true
  }

  async audioSource_changeSource({ IrManager, targetSourceName, VideoControlManager }) {
    const status = { success: false, error: false, errorMessage: '' }
    const source = this.audio.sources.find(source => source.name === targetSourceName)

    try {
      if (!IrManager.isAlive)
        throw new Error(`IrManager is not alive`)
      else if (source === undefined)
        throw new Error(`Audio Switch details not loaded`)

      if (source === undefined)
        throw new Error(`Source not found`)

      const { success, error } = await IrManager.new_sendIrCommand({ commandName: targetSourceName, source: 'Audio Switch' })

      if (!success)
        throw new Error(error)

      this.audio.lastSourceSelected_id = source.id
      status.success = true

      // VideoControlManager.lastSource_id = source.id
      // VideoControlManager.updateLastSource({ videoSourceIndex: source.id })

    } catch (e) {
      status.error = true
      status.errorMessage = `---> Failed to toggle audio power (${e.message})`
      console.error(status.errorMessage)

    } finally {
      return status
    }
  }




}


module.exports = audioManager