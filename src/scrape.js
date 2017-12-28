const ig = require('instagram-tagscrape');
const firebase = require('firebase');
const config = require("../firebase-config.js")
const moment = require("moment")
moment.locale('ja')

/**
 * メイン処理
 */
module.exports = () => {
  return Promise.resolve()
    .then(console.log('scrape start'))
    // .then(initialize())
    .then(() => scrapingAndSendAll())
    // .then(() => firebase.database().goOffline())
    .then(() => console.log('scrape end'))
    .catch(err => console.error(err))
}

/**
 * 初期処理
 */
function initialize() {
  firebase.initializeApp(config);
}

function finalize() {
  firebase.database().goOffline()
}

/**
 * hashtags.jsからスクレイピング -> Firebase送信
 */
function scrapingAndSendAll() {
  const hashtags = require("./hashtags.js")
  return Promise.all(
    hashtags.map(hashtag => {
      return scraping(hashtag.tag)
        .then(data => filterSpam(data))
        .then(data => convertTimestampToDate(data))
        .then(data => sendToFirebase(hashtag, data))
    })
  )
}

/**
 * スクレイピングして結果をpromiseで返す
 * @param {string} tag タグ文字列
 */
function scraping(tag) {
  return ig.scrapeTagPage(tag)
    .then((result) => {
      return result;
    })
}

/**
 * スパムらしき糞投稿が混ざってくるので弾く
 * @param {*} data 
 */
function filterSpam(data) {
  if (!Array.isArray(data.media)) return;

  const filterdMedia = [];
  data.media.forEach((e) => {
    // captionにNUDEという単語があれば弾く
    if (e.caption &&
        (e.caption.includes('NUDЕ') ||
         e.caption.includes('FОIL') ||
         e.caption.includes('->>'))
      ) {
      console.log('スパム発見')
      // console.log(e)
      return;
    }
    filterdMedia.push(e)
  })
  //フィルター後の内容で上書き
  data.media = filterdMedia;
  return Promise.resolve(data)
}

/**
 * 引数をFirebase Databaseに送信する
 * @param {object} data 
*/
function sendToFirebase(hashtag, data) {
  return firebase.database()
    .ref('/instagram/' + hashtag.id)
    .set(data, function () {
      console.log(`scrape send ${(hashtag.name + '　　　　').slice(0, 4)} ${data.count} 件`)
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