const { merge } = require('lodash')
const { create: createClient, buildRequest, parseResponse } = require('./client')
const { parseChannels, parsePrograms } = require('./parser')
const { generate: generateXMLTV } = require('./xmltv')
const { load: loadConfig } = require('./config')
const { sleep, isPromise } = require('./utils')
const Channel = require('./Channel')
const Program = require('./Program')

module.exports.generateXMLTV = generateXMLTV
module.exports.parseChannels = parseChannels
module.exports.Channel = Channel
module.exports.Program = Program

class EPGGrabber {
  constructor(config = {}) {
    this.config = loadConfig(config)
    this.client = createClient(config)
  }

  async loadLogo(channel) {
    const logo = this.config.logo({ channel })
    if (isPromise(logo)) {
      return await logo
    }
    return logo
  }

  async grab(channel, date, cb = () => {}) {
    await sleep(this.config.delay)

    return buildRequest({ channel, date, config: this.config })
      .then(this.client)
      .then(parseResponse)
      .then(data => merge({ channel, date, config: this.config }, data))
      .then(parsePrograms)
      .then(programs => {
        cb({ channel, date, programs })

        return programs
      })
      .catch(err => {
        if (this.config.debug) console.log('Error:', JSON.stringify(err, null, 2))
        cb({ channel, date, programs: [] }, err)

        return []
      })
  }
}

module.exports.EPGGrabber = EPGGrabber
