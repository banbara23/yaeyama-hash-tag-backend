const ig = require('instagram-tagscrape');
const firebase = require('firebase');
const config = require("./firebase-config.js")

/**
 * 初期処理
 */
function initialize() {
    firebase.initializeApp(config);
}

const tag_yaeyama = "%E5%85%AB%E9%87%8D%E5%B1%B1"; // 八重山

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
function sendToFirebase(data) {
    return firebase.database()
        .ref('/')
        .set(data, function () {
            firebase.database().goOffline()
            console.log('send ok')
        })
}

/**
 * メイン処理
 */
Promise.resolve()
    .then(console.log('main start'))
    .then(initialize())
    .then(() => scraping(tag_yaeyama))
    .then(data => sendToFirebase(data))
    .then(() => console.log('main end'))
    .catch(err => console.error(err))