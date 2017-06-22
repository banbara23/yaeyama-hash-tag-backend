const scrape = require("./scrape.js"),
  filter = require("./filter.js");

Promise.resolve()
  .then(() => scrape())
  .then(() => filter())
  .catch(error => console.error(error))