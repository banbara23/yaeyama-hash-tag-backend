const moment = require("moment")

const timestamp = "1497428291"

console.log(moment.locale('ja'))
console.log(moment.unix(timestamp).format('LLL'))