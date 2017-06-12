const ig = require('instagram-tagscrape');
const firebase = require('firebase');
const config = require("./firebase-config.js")

/**
 * 初期処理
 */
function initialize() {
    firebase.initializeApp(config);
}

/**
 * hashtags.jsからスクレイピング -> Firebase送信
 */
function scrapingAndSendAll() {
    const hashtags = require("./hashtags.js")
    return Promise.all(
        hashtags.map(hashtag => {
            return scraping(hashtag.tag)
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
            console.log("scraping ok")
            return result;
        })
}

/**
 * 引数をFirebase Databaseに送信する
 * @param {object} data 
 */
function sendToFirebase(hashtag, data) {
    return firebase.database()
        .ref('/' + hashtag.id)
        .set(data, function () {
            console.log('send ok')
        })
}

/**
 * メイン処理
 */
Promise.resolve()
    .then(console.log('main start'))
    .then(initialize())
    .then(() => scrapingAndSendAll())
    .then(() => firebase.database().goOffline())
    .then(() => console.log('main end'))
    .catch(err => console.error(err))