const logger = require('./logger');
const { argv } = require('./args');
const ghRestApi = require('./github/rest');

// eslint-disable-next-line global-require, import/no-dynamic-require
const scraperModules = argv.scraper.map((scraperModule) => new (require(`./scraper/${scraperModule}`))());
const globalScraperModules = scraperModules.filter((module) => typeof module.scrapeGlobal === 'function');
const repositoryScraperModules = scraperModules.filter((module) => typeof module.scrapeRepositories === 'function');

const scrapeRepositories = (repositories) => {
  repositoryScraperModules.forEach((scraper) => {
    scraper.scrapeRepositories(repositories);
  });
};

const initScrapeGlobal = (interval, spread) => {
  const startScrape = spread ? Math.round(interval * Math.random()) : 0;

  const scrapeHandler = () => {
    globalScraperModules.forEach((scraper) => {
      scraper.scrapeGlobal();
    });
  };

  setTimeout(() => {
    scrapeHandler();
    setInterval(scrapeHandler, interval);
  }, startScrape);
};

const initScrapeOrganization = (organization, interval, spread) => {
  const startScrape = spread ? Math.round(interval * Math.random()) : 0;

  const scrapeHandler = () => {
    const options = ghRestApi.repos.listForOrg.endpoint.merge({
      org: organization,
    });

    ghRestApi.paginate(
      options,
      (response) => response.data.map((repository) => repository.full_name),
    )
      .then((repositories) => scrapeRepositories(repositories))
      .catch((err) => logger.error(`Failed to get all repository from organization ${organization} via REST: `, err.message));
  };

  setTimeout(() => {
    scrapeHandler();
    setInterval(scrapeHandler, interval);
  }, startScrape);
};

const initScrapeUser = (username, interval, spread) => {
  const startScrape = spread ? Math.round(interval * Math.random()) : 0;

  const scrapeHandler = () => {
    const options = ghRestApi.repos.listForUser.endpoint.merge({
      username,
      type: 'owner',
    });

    ghRestApi.paginate(
      options,
      (response) => response.data.map((repository) => repository.full_name),
    )
      .then((repositories) => scrapeRepositories(repositories))
      .catch((err) => logger.error(`Failed to get all repository from user ${username} via REST: `, err.message));
  };

  setTimeout(() => {
    scrapeHandler();
    setInterval(scrapeHandler, interval);
  }, startScrape);
};

const intiScrapeRepositories = (repositories, interval, spread) => {
  const startScrape = spread ? Math.round(interval * Math.random()) : 0;

  const scrapeHandler = () => {
    scrapeRepositories(repositories);
  };

  setTimeout(() => {
    scrapeHandler();
    setInterval(scrapeHandler, interval);
  }, startScrape);
};

module.exports = {
  initScrapeGlobal,
  initScrapeOrganization,
  initScrapeUser,
  intiScrapeRepositories,
};
