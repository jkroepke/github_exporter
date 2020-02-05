const ghRestApi = require('../github/rest');
const metrics = require('../metrics');
const logger = require('../logger');

const scrapeRepositoryRestDetails = (repository) => {
  const [owner, repo] = repository.split('/');

  ghRestApi.repos.get({ owner, repo })
    .then((response) => {
      metrics.githubRepoNetworkGauge.set({ repository }, response.data.network_count);
    })
    .catch((err) => logger.error(`Failed to scrape repository ${repository} via REST: ${err.message}`));
};

const scrapeRepositoryContributors = (repository) => {
  const [owner, repo] = repository.split('/');

  const options = ghRestApi.repos.listContributors.endpoint.merge({ owner, repo });

  ghRestApi.paginate(
    options,
    // data is null if repository is empty
    (response) => (response.data || []).map((collaborator) => collaborator),
  )
    .then((repositoryContributors) => {
      metrics.githubRepoContributorsGauge.set({ repository }, repositoryContributors.length);
    })
    .catch((err) => logger.error(`Failed to scrape contributors from repository ${repository} via REST: ${err.message}`));
};

const scrapeRepositoryTrafficClones = (repository) => {
  const [owner, repo] = repository.split('/');

  ghRestApi.repos.getClones({ owner, repo, per: 'day' })
    .then((response) => {
      response.data.clones.forEach((cloneMetric) => {
        metrics.githubRepoClonesGauge.set(
          { repository }, cloneMetric.count, Date.parse(cloneMetric.timestamp),
        );
        metrics.githubRepoClonesUniqueGauge.set(
          { repository }, cloneMetric.uniques, Date.parse(cloneMetric.timestamp),
        );
      });
    })
    .catch((err) => logger.error(`Failed to scrape clone metrics for repository ${repository} via REST: ${err.message}`));
};

const scrapeRepositoryTrafficTopPaths = (repository) => {
  const [owner, repo] = repository.split('/');
  ghRestApi.repos.getTopPaths({ owner, repo })
    .then((response) => {
      response.data.forEach((path) => {
        metrics.githubRepoPopularContentViewsGauge.set(
          { repository, path: path.path }, path.count,
        );
        metrics.githubRepoPopularContentViewsUniqueGauge.set(
          { repository, path: path.path }, path.uniques,
        );
      });
    })
    .catch((err) => logger.error(`Failed to scrape path metrics for repository ${repository} via REST: ${err.message}`));
};

const scrapeRepositoryTrafficTopReferrers = (repository) => {
  const [owner, repo] = repository.split('/');
  ghRestApi.repos.getTopReferrers({ owner, repo })
    .then((response) => {
      response.data.forEach((referrer) => {
        metrics.githubRepoReferrerViewsGauge.set(
          { repository, referrer: referrer.referrer }, referrer.count,
        );
        metrics.githubRepoReferrerViewsUniqueGauge.set(
          { repository, referrer: referrer.referrer }, referrer.uniques,
        );
      });
    })
    .catch((err) => logger.error(`Failed to scrape referrer metrics for repository ${repository} via REST: ${err.message}`));
};

const scrapeRepositoryTrafficViews = (repository) => {
  const [owner, repo] = repository.split('/');
  ghRestApi.repos.getViews({ owner, repo })
    .then((response) => {
      response.data.views.forEach((viewMetric) => {
        metrics.githubRepoViewsGauge.set(
          { repository }, viewMetric.count, Date.parse(viewMetric.timestamp),
        );
        metrics.githubRepoViewsUniqueGauge.set(
          { repository }, viewMetric.uniques, Date.parse(viewMetric.timestamp),
        );
      });
    })
    .catch((err) => logger.error(`Failed to scrape view metrics for repository ${repository} via REST: ${err.message}`));
};

module.exports = {
  scrapeRepositoryRestDetails,
  scrapeRepositoryContributors,
  scrapeRepositoryTrafficClones,
  scrapeRepositoryTrafficTopPaths,
  scrapeRepositoryTrafficTopReferrers,
  scrapeRepositoryTrafficViews,
};
