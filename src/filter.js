const firebase = require('firebase');
const moment = require("moment")
let raw = {},
  index = [],
  public = {};
let newIndex = {},
  newPublic = {}

/**
 * メイン処理
 */
module.exports = () => {
  return Promise.resolve()
    .then(console.log('filter start'))
    .then(() => initialize())
    .then(() => makeSendData())
    .then(() => sendToFirebase('/public_index', newIndex))
    .then(() => sendToFirebase('/public', newPublic))
    .catch(err => console.error(err))
    // .then(() => firebase.database().goOffline())
    .then(() => console.log('filter end'))
}

/**
 * 初期処理、dbから必要なファイルを取得
 */
function initialize() {
  // const config = require("../firebase-config.js")
  // firebase.initializeApp(config);

  moment.locale('ja')

  return Promise.all([
    readDatabase('/instagram')
      .then(data => raw = data),
    readDatabase('/public')
      .then(response => public = response),
    readDatabase('/public_index')
      .then(response => index = response)
  ])
}

/**
 * 公開前の生データを取得
 */
function getRaw(id) {
  return raw[id] ? raw[id].media : [];
}

/**
 * 公開済み値を取得する
 * @param {string} id タグ
 * @return {array} 配列
 */
function getPublic(id) {
  return public ? public[id] : [];
}

/**
 * 公開済みインデックスを取得する
 * @param {string} id タグ
 * @return {array} 配列
 */
function getIndex(id) {
  return index ? index[id] : [];
}

/**
 * 送信データ作成
 * 1. hashtags.jsを取得し、mapで回す
 * 2. 自分の生データ、インデックス、公開データを取得する
 */
function makeSendData() {
  const hashtags = require("./hashtags.js");
  return Promise.all(
    hashtags.map(hashtag => {
      return new Promise(function (resolve, reject) {
        const id = hashtag.id;
        // console.log(id);
        // エラーチェック 生データはあるか？
        if (!raw) {
          reject('生データないので処理せずスキップ');
        }
        // console.log(`${id} raw ${getRaw(id).length}件`)
        // 選別開始
        // console.log('選別開始');
        const filtered = filter(id); // フィルターで取得する値だけ取得
        if (!filtered) resolve();
        console.log(`filter ${(id + '            ').slice(0, 12)} ${filtered.length} 件`)

        // 選別した値をインデックス＆公開テーブルに追加する
        // console.log('選別した値をインデックス＆公開テーブルに追加する');
        // インデックスに追加
        const newIdx = (function () {
          let idx = [];
          filtered.forEach(function (elm) {
            idx.push(elm.code)
          })
          return idx;
        })();

        // 公開に追加
        const newPub = (function () {
          let idx = [];
          filtered.forEach(function (elm) {
            idx.push({
              code: elm.code,
              caption: elm.caption,
              data: moment.unix(elm.date).format('LLL'),
              thumbnail_src: elm.thumbnail_src,
              display_src: elm.display_src,
              is_video: elm.is_video
            })
          })
          return idx;
        })();

        // 送信用変数にセットする
        newIndex[id] = newIdx.concat(getIndex(id));
        newPublic[id] = newPub.concat(getPublic(id));

        // 保存データを制限
        const limit = 30; // 制限値
        newIndex[id].splice(limit, newIndex[id].length)
        newPublic[id].splice(limit, newPublic[id].length)

        // 完了
        resolve();
      })
    })
  )
}

/**
 * 公開以外の値を返す
 * @param {string} id 
 */
function filter(id) {
  const index = getIndex(id);

  // インデックスが空なら全件追加するためフィルター処理する必要はない
  if (!index) return getRaw(id);

  return getRaw(id).filter(function (data) {
    return index.indexOf(data.code) < 0;
  })
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
      console.log(`filter send ${path}`)
    })
}

/**
 * Firebaseからデータ取得
 * @param {string} path パス
 */
function readDatabase(path) {
  return firebase.database()
    .ref(path)
    .once('value')
    .then(function (snapshot) {
      return snapshot.val();
    })
}