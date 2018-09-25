'use strict'

const axios = require('axios')
const { Readable } = require('stream')

const delay = ttl => new Promise(resolve => setTimeout(resolve, ttl))

module.exports = class ShopifyScraper extends Readable {

  constructor({
    rateLimit = 4, // Max API calls per second
    hostname, // Storefront hostname
    apiKey, // Admin API client key
    apiSecret, // Admin API secret key
    highWaterMark, // Max memory consumption of stream
    query = {}, // Query params for Admin API
  }) {
    super({
      highWaterMark,
      objectMode: true,
    })

    this.page = 0
    this.waitTime = Math.ceil(1000 / this.rateLimit) + 1
    this.query = {
      limit: 10, // max 250
      fields: 'id,title',
      ...query,
    }

    const credentials = Buffer.from([ apiKey, apiSecret ].join(':')).toString('base64')

    this.api = axios.create({
      baseURL: `https://${hostname}/admin`,
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    })
  }

  _read() {
    this.api.get('/products.json', {
      params: {
        ...this.query,
        page: this.page,
      },
    })
      .then(r => r.data.products)
      .then(products => {
        if (!products || !products.length) {
          this.emit('end')
        }
        this.pause()
        products.forEach(p => this.push(p))
      })

      // If it's not the first iteration, and if this iteration
      // is running too quick for the API rate limit, we wait a bit..
      .then(() => {
        if (this.timeLastRead && this.timeLastRead > (this.waitTime + Date.now())) {
          this.timeLastRead = Date.now()
          return delay(this.waitTime)
        } else {
          this.timeLastRead = Date.now()
        }
      })

      // Ready for the next page
      .then(() => {
        this.page++
        this.resume()
      })

      .catch(e => {
        this.emit('error', e)
      })
  }

}
