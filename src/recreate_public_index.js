/**
 * recreate_public_index
 * 
 * 動作時のpublicからpublic_indexを作り直して強制上書きする。
 * publicとpublic_indexの整合性が合わない時にこのjsを使用する。
 */
const firebase = require('firebase');
let newIndex = {}

/**
 * メイン処理
 */

return Promise.resolve()
  .then(console.log('recreate_public_index start'))
  .then(() => initialize())
  .then(() => createNewIndex())
  .then(() => sendToFirebase('/public_index', newIndex))
  .catch(err => console.error(err))
  .then(() => firebase.database().goOffline())
  .then(() => console.log('recreate_public_index end'))

/**
 * 初期処理、dbから必要なファイルを取得
 */
function initialize() {
  const config = require("../firebase-config.js")
  firebase.initializeApp(config);

  return Promise.all([
    readDatabase('/public')
      .then(response => public = response)
  ])
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
 * 送信データ作成
 * 1. hashtags.jsを取得し、mapで回す
 * 2. 自分の生データ、インデックス、公開データを取得する
 */
function createNewIndex() {
  const hashtags = require("./hashtags.js");
  return Promise.all(
    hashtags.map(hashtag => {
      return new Promise(function (resolve, reject) {
        const id = hashtag.id;
        // console.log(id);
        // エラーチェック 生データはあるか？
        if (!getPublic(id)) {
          reject(id + ':publicデータないので処理せずスキップ');
        }
        // console.log(`${id} raw ${getRaw(id).length}件`)
        // 選別開始
        // console.log('選別開始');
        const pub = getPublic(id);
        // インデックスに追加
        const newIdx = (function () {
          let idx = [];
          pub.forEach(function (elm) {
            idx.push(elm.code)
          })
          return idx;
        })();

        // 送信用変数にセットする
        newIndex[id] = newIdx;
        // 完了
        resolve();
      })
    })
  )
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
    .set(data)
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