const QUERY = "front+end+developer";
const STATE = "Massachusetts"; //state to look in
const PAGES = 3; //number of pages to scrape
const FILENAME = "frontend_nov11"; //will be saved as .json in data/joblinks/

// Example URL to get # of pages needed
// https://www.indeed.com/jobs?q=front+end+developer&l=Massachusetts&radius=0&sort=date&limit=50&fromage=7&start=0

const rp = require("request-promise");
const cheerio = require("cheerio");

const pageStarts = [...new Array(PAGES)].map((_, i) => i * 50);
let data = [];
let page = 1; //incremented in scrapePage() to log progress, page scraping not necessarily in order

pageStarts.forEach(start => {
  data.push(scrapePage(start));
});

Promise.all(data).then(function(data) {
  //flatten array and remove sponsored listings
  var cleanData = []
    .concat(...data)
    .filter(d => d.link.indexOf("/pagead/") === -1);
  //save file
  console.log(`Saving ${cleanData.length} jobs to ${FILENAME}.json`);
  const fs = require("fs");
  fs.writeFile(
    `./data/joblinks/${FILENAME}.json`,
    JSON.stringify(cleanData),
    function(err) {
      if (err) {
        console.log(err);
      }
    }
  );
});

function scrapePage(start) {
  return new Promise(function(resolve, reject) {
    const url = `https://www.indeed.com/jobs?q=${QUERY}&l=${STATE}&radius=0&sort=date&limit=50&fromage=7&start=${start}`;
    const options = {
      uri: url,
      transform: function(body) {
        return cheerio.load(body);
      }
    };
    // scrape job titles/links and push them to the data array
    let pageData = [];
    rp(options)
      .then($ => {
        $("a[data-tn-element='jobTitle']").each(i => {
          const title = $("a[data-tn-element='jobTitle']")[i].attribs.title;
          const link = $("a[data-tn-element='jobTitle']")[i].attribs.href;
          if (title && link) pageData.push({ title, link });
        });
        console.log(`Scraping page #${page}`);
        page++;
        resolve(pageData);
      })
      .catch(err => {
        console.log(err);
      });
  });
}
