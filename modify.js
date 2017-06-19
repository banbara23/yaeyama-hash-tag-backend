const firebase = require('firebase');
const config = require("./firebase-config.js")

/**
 * メイン処理
 */
Promise.resolve()
  .then(console.log('main start'))
  .then(initialize())
  .then(() => getRaw())
  .then(val => modify(val))
  .then(() => firebase.database().goOffline())
  .then(() => console.log('main end'))
  .catch(err => console.error(err))

/**
 * 初期処理
 */
function initialize() {
  firebase.initializeApp(config);
}

function getRaw() {
  return firebase.database()
    .ref('/instagram/')
    .once('value')
    .then(function (snapshot) {
      return snapshot.val();
    })
}

function getPublic() {
  firebase.database()
    .ref('/public/yaeyama')
    .once('value')
    .then(function (snapshot) {
      return snapshot.val();
    })
}

function modify(val) {
  const publicData = getPublic();
  if (!publicData) {
    publicData = [];
  }

  if (!Array.isArray(val.yaeyama.media)) return;
  let temp = val.yaeyama.media.filter(function (raw) {
    return hasPublic(raw, public) //公開へ追加
  })
}

/**
 * 公開済みデータが持っているか？
 * @param {Array} raw 取得したばかりの生データ
 * @param {Array} public 公開済みデータ
 */
function hasPublic(raw, public) {
  for (pub of public) {
    if (raw.code == pub.code) {
      return true;
    }
  }
  return false;
  // public.forEach(function (pub) {

  // });
}

/**
 * hashtags.jsからスクレイピング -> Firebase送信
 */
function scrapingAndSendAll() {
  const hashtags = require("./hashtags.js")
  return Promise.all(
    hashtags.map(hashtag => {
      return scraping(hashtag.tag)
        .then(data => convertTimestampToDate(data))
        .then(data => sendToFirebase(hashtag, data))
    })
  )
}

/**
 * 引数をFirebase Databaseに送信する
 * @param {object} data 
*/
function sendToFirebase(hashtag, data) {
  return firebase.database()
    .ref('/show/' + hashtag.id)
    .set(data, function () {
      console.log(`send ${hashtag.name}`)
    })
}

/**
 * タイムスタンプを日付に変換して'post_date'に追加する
 * @param {object} data スクレイピング済みデータ
 */
function convertTimestampToDate(data) {
  if (!Array.isArray(data.media)) return;

  data.media.forEach(function (elm) {
    elm.post_date = moment.unix(elm.date).format('LLL');
  }, this);

  return Promise.resolve(data);
}