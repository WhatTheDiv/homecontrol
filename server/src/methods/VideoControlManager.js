
class videoControlManager {
  constructor() {
    this.video = {
      videoSources: [],
      lastSource_id: -1,
      defaultSource: 'last'
    }
    this.defaultSourceOptions = [
      'last', 'Bedroom Tv', 'Living Room Tv'
    ]
  }

  async activate({ VideoSources }) {
    if (VideoSources !== undefined)
      this.video.videoSources = VideoSources
  }

  updateLastSource({ videoSourceIndex }) {
    console.log('updating last source to ', videoSourceIndex)
    if (videoSourceIndex >= 0)
      this.lastSource_id = videoSourceIndex

    console.log('videoControlManager now:', this.video)
  }

  setDefaultSaurce(newSource) {
    const defaultSourceOptionIndex = this.defaultSourceOptions.indexOf(newSource)
    if (defaultSourceOptionIndex >= 0)
      this.video.defaultSource = this.defaultSourceOptions[defaultSourceOptionIndex]
  }
}

module.exports = videoControlManager