var ig = require('instagram-tagscrape');

const tag = "%E5%85%AB%E9%87%8D%E5%B1%B1"; // 八重山

ig.scrapeTagPage(tag).then(function (result) {
    console.dir(result);
})
