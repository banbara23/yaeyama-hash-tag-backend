console.time("yaeyama-hashtag-backend");
const InstagramSearchTags = require('instagram-searchtags')
const firebase = require('firebase');
const config = require("./firebase-config.js")
const moment = require("moment")
const hashtags = require("./hashtags.js")
moment.locale('ja')
const searchTags = new InstagramSearchTags({
    username: 'banbara23',
    password: 'banbara',
  });

/**
 * メイン処理
 */
Promise.resolve()
  .then(console.log('main start'))
  .then(initialize())
  .then(() => scrapeAndSend(hashtags.yaeyama))
  .then(() => scrapeAndSend(hashtags.ishigaki))
  .then(() => scrapeAndSend(hashtags.iriomote))
  .then(() => scrapeAndSend(hashtags.taketomi))
  .then(() => scrapeAndSend(hashtags.taketomicho))
  .then(() => scrapeAndSend(hashtags.kohama))
  .then(() => scrapeAndSend(hashtags.kuroshima))
  .then(() => scrapeAndSend(hashtags.hatoma))
  .then(() => scrapeAndSend(hashtags.hateruma))
  .then(() => scrapeAndSend(hashtags.yonaguni))
  .catch(err => console.error(err))
  .then(() => searchTags.close())
  .then(() => firebase.database().goOffline())
  .then(() => console.log('main end'))
  .then(() => console.timeEnd("yaeyama-hashtag-backend"))

/**
 * 初期処理
 */
function initialize() {
  firebase.initializeApp(config);
}

/**
 * hashtags.jsからスクレイピング -> Firebase送信
 */
function scrapeAndSend(hashtag) {
  console.log(hashtag.name)
  return scraping(hashtag.tag)
    .then(nodes => convertTimestampToDate(nodes))
    .then(nodes => sendToFirebase(hashtag, nodes))
    .then(() => sleep())
}

/**
 * スクレイピングして結果をpromiseで返す
 * @param {string} tag タグ文字列
 */
function scraping(tagword) {
  return searchTags.login()
    .then(() => {
      const tag = searchTags.createTag(tagword)
      return tag.fetchNodes(5)
    })
    .then((nodes) => {
      // console.log(nodes)
      searchTags.close()
      return (nodes)
    })
    .catch((err) => {
      console.error(`Error: ${err.message}`)
      
      throw new Error('スクレイピング失敗!!')
    })
}

/**
 * 引数をFirebase Databaseに送信する
 * @param {object} data 
*/
function sendToFirebase(hashtag, nodes) {
  return firebase.database()
    .ref('/' + hashtag.id)
    .set(nodes, function () {
      console.log(`send OK ${hashtag.name}`)
    })
}

/**
 * タイムスタンプを日付に変換して'post_date'に追加する
 * @param {object} data スクレイピング済みデータ
 */
function convertTimestampToDate(nodes) {
  if (!Array.isArray(nodes)) return;

  nodes.forEach(function (node) {
    node.post_date = moment.unix(node.date).format('LLL');
  }, this);

  return Promise.resolve(nodes);
}

function sleep() {
  const INTERVAL = 5000;
  console.log(INTERVAL / 1000 + '秒のインターバル')
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, INTERVAL);

  })
}