const ghRestApi = require('./github/rest');

const graphqlScraper = require('./scraper/graphql');
const restScraper = require('./scraper/rest');


const scrapeRepositories = (repositories) => {
  graphqlScraper.scrapeRepositoriesGraphQlDetails(repositories);

  repositories.forEach((repository) => {
    restScraper.scrapeRepositoryRestDetails(repository);
    restScraper.scrapeRepositoryContributors(repository);

    restScraper.scrapeRepositoryTrafficClones(repository);
    restScraper.scrapeRepositoryTrafficTopPaths(repository);
    restScraper.scrapeRepositoryTrafficTopReferrers(repository);
    restScraper.scrapeRepositoryTrafficViews(repository);
  });
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
      .catch((err) => console.error(`Failed to get all repository from organization ${organization} via REST: `, err.message));
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
  initScrapeOrganization,
  intiScrapeRepositories,
};
