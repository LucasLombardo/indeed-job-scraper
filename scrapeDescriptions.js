const jobs = require("./frontend.json");

const rp = require("request-promise");
const cheerio = require("cheerio");

const descs = [];

jobs.forEach((job, i) => {
  const url = `https://www.indeed.com${job.link}`;
  const options = {
    uri: url,
    transform: function(body) {
      return cheerio.load(body);
    }
  };
  // scrape job titles/links and push them to the data array
  rp(options)
    .then($ => {
      const desc = $(".jobsearch-JobComponent-description").text();
      const company = $(
        ".jobsearch-JobInfoHeader-subtitle > div > div:first-of-type"
      ).text();
      const location = $(
        ".jobsearch-JobInfoHeader-subtitle > div > div:last-of-type"
      ).text();
      const postedTime = $(".jobsearch-JobMetadataFooter").text;
      descs.push({
        title: job.title,
        link: job.link,
        desc,
        company,
        location,
        postedTime
      });
      console.log("scraping job #" + i);
    })
    .catch(err => {
      console.log(err);
    });
});

// Save data array as a JSON file
setTimeout(() => {
  const fs = require("fs");
  fs.writeFile("frontendfull.json", JSON.stringify(descs), function(err) {
    if (err) {
      console.log(err);
    }
  });
}, 60000);
