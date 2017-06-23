const ig = require('instagram-tagscrape');
const fs = require('fs');
const tag = 'yaeyama';
ig.scrapeTagPage(tag)
  .then((result) => {
    fs.writeFile(`./scrape/${tag}.json`, JSON.stringify(result));
  })