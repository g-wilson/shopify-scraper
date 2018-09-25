# Shopify Product Scraper

An efficient and easy way to scrape a LOT of products using Shopify's Admin API.

A Node.js Readable Stream is used to provide a nice developer API. After constructing a scraper instance, the `data` event subscriber of the Stream is invoked for each product scraped.

An example might be to run an indexing operation for each product in a storefront. On each product, you might modify the object, and add it to your ElasticSearch instance.

Requires a registered ["Private app"](https://help.shopify.com/en/api/getting-started/authentication/private-authentication) to make authenticated API calls.

### Example Usage

```js

// Create an instance
const scraper = new ShopifyScraper({

  hostname: '',   // Hostname of the Shopify storefront e.g. my-shop.shopify.com
  apiKey: '',     // Your app key
  apiSecret: '',  // Your app secret

  // Query params for the API call (excluding `page`)
  // Defaults are listed below.
  // See https://help.shopify.com/en/api/reference/products/product#endpoints
  query: {
    limit: 10,
    fields: 'id,title',
  },

  rateLimit: 4, // Max number of API calls per second https://help.shopify.com/en/api/getting-started/api-call-limit

})

let counter = 0

scraper.on('error', e => {
  console.error(e)
})

scraper.on('end', () => {
  console.log(`All done! ${counter} products!`)
})

// First API call is run when the data callback is added
scraper.on('data', product => {
  console.log(product.title)
  counter++
})

```
