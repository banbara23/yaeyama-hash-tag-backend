const firebase = require('firebase'),
  scrape = require("./src/scrape.js"),
  filter = require("./src/filter.js"),
  top = require("./src/top.js")

module.exports = () => Promise.resolve()
  .then(console.log('index start'))
  .then(() => (initialize()))
  .then(() => scrape())
  .then(() => filter())
  .then(() => top())
  .catch(error => console.error(error))
  // .then(() => (finalize()))
  .then(() => (console.log('index end')))

/**
* 開店準備
*/
function initialize() {
  if (!firebase.apps.length) {
    firebase.initializeApp(require("./firebase-config.js"));
  }
}

/**
 * 店じまい
 */
function finalize() {
  return firebase.database().goOffline()
}