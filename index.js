const scrape = require("./scrape.js"),
  filter = require("./filter.js");

Promise.resolve()
  .then(console.log('index start'))
  .then(() => scrape())
  .then(() => filter())
  .catch(error => console.error(error))
  .then(() => (console.log('index end')))