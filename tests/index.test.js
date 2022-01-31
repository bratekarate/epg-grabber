/**
 * @jest-environment node
 */

import grabber from '../src/index'
import axios from 'axios'

jest.mock('axios')

it('return "Connection timeout" error if server does not response', done => {
  const config = {
    site: 'example.com',
    request: {
      timeout: 1000
    },
    url({ date, channel }) {
      return `https://www.cosmote.gr/cosmotetv/residential/program/epg/programchannel?p_p_id=channelprogram_WAR_OTETVportlet&p_p_lifecycle=0&_channelprogram_WAR_OTETVportlet_platform=IPTV&_channelprogram_WAR_OTETVportlet_date=${date.format(
        'DD-MM-YYYY'
      )}&_channelprogram_WAR_OTETVportlet_articleTitleUrl=${channel.site_id}`
    },
    parser: () => []
  }
  const channel = {
    site: 'example.com',
    site_id: 'cnn',
    xmltv_id: 'CNN.us',
    lang: 'en',
    name: 'CNN'
  }
  grabber.grab(channel, '2022-01-01', config, (data, err) => {
    expect(err.message).toBe('Connection timeout')
    done()
  })
})

it('can grab single channel programs', done => {
  const data = {
    data: {
      toString: () => 'string'
    }
  }
  axios.mockImplementation(() => Promise.resolve(data))

  const config = {
    site: 'example.com',
    url: 'http://example.com/20210319/1tv.json',
    parser: () => []
  }
  const channel = {
    site: 'example.com',
    site_id: '1',
    xmltv_id: '1TV.fr',
    lang: 'fr',
    name: '1TV'
  }
  grabber
    .grab(channel, '2022-01-01', config, (data, err) => {
      if (err) {
        console.log(`    Error: ${err.message}`)
        done()
      } else {
        console.log(
          `  ${data.channel.site} - ${data.channel.xmltv_id} - ${data.date.format(
            'MMM D, YYYY'
          )} (${data.programs.length} programs)`
        )
      }
    })
    .then(programs => {
      expect(programs.length).toBe(0)
      done()
    })
})
