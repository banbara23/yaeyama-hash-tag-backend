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
Promise.resolve()
  .then(console.log('main start'))
  .then(() => initialize())
  .then(() => makeSendData())
  .then(() => sendToFirebase('/public_index', newIndex))
  .then(() => sendToFirebase('/public', newPublic))
  .catch(err => console.error(err))
  .then(() => firebase.database().goOffline())
  .then(() => console.log('main end'))

/**
 * 初期処理、dbから必要なファイルを取得
 */
function initialize() {
  const config = require("./firebase-config.js")
  firebase.initializeApp(config);

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
  // return Promise.resolve(raw[id].media);
  return raw[id].media;
}

/**
 * 公開済み値を取得する
 * @param {string} id タグ
 * @return {array} 配列
 */
function getPublic(id) {
  // return Promise.resolve(public[id]);
  if (public) {
    return public[id]
  }
  else {
    return [];
  }
}

/**
 * 公開済みインデックスを取得する
 * @param {string} id タグ
 * @return {array} 配列
 */
function getIndex(id) {
  // return Promise.resolve(index[id]);
  if (index) {
    return index[id]
  }
  else {
    return [];
  }
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
      return new Promise(function (resolve,reject) {
        const id = hashtag.id;
        console.log(id);
        // エラーチェック 生データはあるか？
        if (!Array.isArray(getRaw(id))) {
          console.log('生データなし、ループ終了');
          resolve();
        }
        // 選別開始
        // console.log('選別開始');
        const filtered = filter(id); // フィルターで取得する値だけ取得
        if (!filtered) resolve();
        console.log(filtered.length)

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

        // 既存のデータがあれば送信用変数にセットする

        if (getIndex(id).length > 0) {
          newIndex[id] = getIndex(id);  // index
        }

        if (getPublic(id).length > 0) {
          public[id] = getPublic(id);    // 公開済み
        }

        newIndex[id] = newIdx;
        newPublic[id] = newPub;

        // console.log(newIndex[id])
        // console.log(newPub[id])

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
  if (!index) {
    // インデックスが空なら全件追加
    return getRaw(id);
  }

  return getRaw(id).filter(function (data) {
    return index.indexOf(data.code);
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
      console.log(`send ${path}`)
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