const ig = require('instagram-tagscrape');
const fs = require('fs');
const tag = 'hashtag';
ig.scrapeTagPage(tag)
  .then((result) => {
    fs.writeFile(`${tag}.json`, JSON.stringify(result));
  })