const firebase = require('firebase');

/**
 * メイン処理
 */
module.exports = () => {
  console.log('top start')
  return Promise.resolve()
    // .then(() => (initialize()))
    .then(() => (readDatabase("/public")))
    .then(publicData => (createTopData(publicData)))
    .then((data) => sendToFirebase('/top', data))
    .catch(error => (console.error(error)))
    // .then(() => (finalize()))
    .then(() => (console.log('top end')))
}

/**
 * 開店準備
 */
function initialize() {
  return firebase.initializeApp(require("../firebase-config.js"));
}

/**
 * 店じまい
 */
function finalize() {
  return firebase.database().goOffline()
}

/**
 * Firebaseからデータ取得
 * @param {string} path パス
 */
function readDatabase(path) {
  // console.log("top readDatabase")
  return firebase.database()
    .ref(path)
    .once('value')
    .then(function (snapshot) {
      return snapshot.val();
    })
}

function createTopData(publicData) {
  return {
    yaeyama: publicData.yaeyama[0],
    ishigaki: publicData.ishigaki[0],
    iriomote: publicData.iriomote[0],
    taketomi: publicData.taketomi[0],
    kohama: publicData.kohama[0],
    kuroshima: publicData.kuroshima[0],
    hatoma: publicData.hatoma[0],
    hateruma: publicData.hateruma[0],
    yonaguni: publicData.yonaguni[0]
  }
}

/**
 * Firebaseに送信
 * @param {string} path 送信先のパス
 * @param {any} data 送信データ
 */
function sendToFirebase(path, data) {
  // console.log(data)
  return firebase.database()
    .ref(path)
    .update(data, function () {
      console.log(`top send ${path}`)
    })
}