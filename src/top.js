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
  return [
    { code: "yaeyama", title: "八重山", url: publicData.yaeyama[0].thumbnail_src },
    { code: "ishigaki", title: "石垣島", url: publicData.ishigaki[0].thumbnail_src },
    { code: "iriomote", title: "西表島", url: publicData.iriomote[0].thumbnail_src },
    { code: "taketomi", title: "竹富島", url: publicData.taketomi[0].thumbnail_src },
    { code: "kohama", title: "小浜島", url: publicData.kohama[0].thumbnail_src },
    { code: "kuroshima", title: "黒島", url: publicData.kuroshima[0].thumbnail_src },
    { code: "hatoma", title: "鳩間島", url: publicData.hatoma[0].thumbnail_src },
    { code: "hateruma", title: "波照間島", url: publicData.hateruma[0].thumbnail_src },
    { code: "yonaguni", title: "与那国島", url: publicData.yonaguni[0].thumbnail_src }
  ]
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
    .set(data, function () {
      console.log(`top send ${path}`)
    })
}