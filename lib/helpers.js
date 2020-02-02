module.exports.getRepositoriesFromOrganization = async (octokit, organization) => {
  const repositories = [];

  const options = octokit.repos.listForOrg.endpoint.merge({
    org: organization,
  });

  for await (const response of octokit.paginate.iterator(options)) {
    repositories.push(...response.data.map((repository) => repository.full_name));
  }

  return repositories;
};

module.exports.scrapeRepository = async (metrics, octokit, organization) => {
/*
  githubRepoIssuesGauge
  githubRepoPullRequestsGauge
  githubRepoWatchersGauge
  githubRepoStarsGauge
  githubRepoForksGauge
  githubRepoCommitsGauge
  githubRepoBranchesGauge
  githubRepoPackagesGauge
  githubRepoReleasesGauge
  githubRepoContributorsGauge
  githubRepoClonesGauge
  githubRepoClonesUniqueGauge
  githubRepoContentViewsGauge
  githubRepoContentViewsUniqueGauge
  githubRepoDependenciesGauge
  githubRepoDependentsGauge
  githubRepoReferrerViewsGauge
  githubRepoReferrerViewsUniqueGauge
  githubRepoPopularContentViewsGauge
  githubRepoPopularContentViewsUniqueGauge
 */

};
