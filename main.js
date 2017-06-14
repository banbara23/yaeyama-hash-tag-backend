const ig = require('instagram-tagscrape');
const firebase = require('firebase');
const config = require("./firebase-config.js")
const moment = require("moment")
moment.locale('ja')

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
                .then(data => fixData(data))
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
 * 引数をFirebase Databaseに送信する
 * @param {object} data 
 */
function sendToFirebase(hashtag, data) {
    return firebase.database()
        .ref('/instagram/' + hashtag.id)
        .set(data, function () {
            console.log(`send ${hashtag.name}`)
        })
}

function fixData(data) {
    // console.log(data.media)
    // data.media.array.forEach(function(element) {
    //     console.log(element)
    // }, this);
    console.log(moment.unix(timestamp).format('LLL'))
    return Promise.resolve(data);

}