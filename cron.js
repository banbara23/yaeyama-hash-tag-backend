const {CronJob} = require('cron');
const moment = require("moment");
const index = require('./index.js')

new CronJob('00 */3 * * * *', () => {
  console.log(moment().format('LLL'))
  index()
}, null, true);

// タイムゾーン
// https://github.com/moment/moment-timezone

/**
Seconds: 0-59
Minutes: 0-59
Hours: 0-23
Day of Month: 1-31
Months: 0-11
Day of Week: 0-6 0が日曜
*/

// */3 * * * * 3分おきに実行
// 毎30分 '*/30 * * * *'
// 平日毎日11:30 '00 30 11 * * 1-5'
