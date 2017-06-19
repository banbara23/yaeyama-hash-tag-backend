const InstagramSearchTags = require('instagram-searchtags')
const firebase = require('firebase');
const config = require("./firebase-config.js")
const moment = require("moment")
const hashtags = require("./hashtags.js")
moment.locale('ja')


/**
 * メイン処理
 */
Promise.resolve()
  .then(console.log('main start'))
  .then(initialize())
  .then(() => scrape(hashtags.yaeyama))
  .then(() => scrape(hashtags.ishigaki))
  .then(() => scrape(hashtags.iriomote))
  .then(() => scrape(hashtags.taketomi))
  .then(() => scrape(hashtags.taketomicho))
  .then(() => scrape(hashtags.kohama))
  .then(() => scrape(hashtags.kuroshima))
  .then(() => scrape(hashtags.hatoma))
  .then(() => scrape(hashtags.hateruma))
  .then(() => scrape(hashtags.yonaguni))
  .catch(err => console.error(err))
  .then(() => firebase.database().goOffline())
  .then(() => console.log('main end'))

/**
 * 初期処理
 */
function initialize() {
  firebase.initializeApp(config);
}

/**
 * hashtags.jsからスクレイピング -> Firebase送信
 */
function scrape(hashtag) {
  
  return scraping(hashtag.tag)
      .then(nodes => convertTimestampToDate(nodes))
      .then(nodes => sendToFirebase(hashtag, nodes))
}

/**
 * スクレイピングして結果をpromiseで返す
 * @param {string} tag タグ文字列
 */
function scraping(tagword) {
  const searchTags = new InstagramSearchTags({
    username: 'banbara23',
    password: 'banbara',
  });
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
      searchTags.close()
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
      console.log(`send ${hashtag.name}`)
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