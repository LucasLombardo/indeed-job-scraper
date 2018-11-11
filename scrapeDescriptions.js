const FILENAME = "frontend_nov11";

const jobs = require(`./data/joblinks/${FILENAME}`);
const rp = require("request-promise");
const cheerio = require("cheerio");

let jobnum = 1; //to be incremented in scrapeJob() to log progress

// map over job links, returning promise for scraped data
const jobarr = [...jobs];
const data = jobarr.map(job => scrapeJob(job));

// once all promises resolve, save the JSON file
Promise.all(data).then(function(data) {
  console.log(`Saving ${data.length} jobs to ${FILENAME}.json`);
  const fs = require("fs");
  fs.writeFile(
    `./data/jobdescriptions/${FILENAME}_desc.json`,
    JSON.stringify(data),
    function(err) {
      if (err) {
        console.log(err);
      }
    }
  );
});

function scrapeJob(job) {
  // scrapes one job page, returns a promise
  return new Promise(function(resolve, reject) {
    const url = `https://www.indeed.com${job.link}`;
    const options = {
      uri: url,
      transform: function(body) {
        return cheerio.load(body);
      }
    };
    rp(options)
      .then($ => {
        // scrape new properties from job page
        const desc = $(".jobsearch-JobComponent-description").text();
        const company = $(
          ".jobsearch-JobInfoHeader-subtitle > div > div:first-of-type"
        ).text();
        const location = $(
          ".jobsearch-JobInfoHeader-subtitle > div > div:last-of-type"
        ).text();
        const postedTime = $(".jobsearch-JobMetadataFooter").text();
        // add properties to a new job
        const newJob = {
          ...job,
          desc,
          company,
          location,
          postedTime
        };
        // print progress and increment
        console.log("Scraping job page #" + jobnum);
        jobnum++;
        resolve(newJob);
      })
      .catch(err => {
        console.log(err);
      });
  });
}
