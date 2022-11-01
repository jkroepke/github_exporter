const Prometheus = require('prom-client')
const ghRestApi = require('../github/rest')
const logger = require('../logger')

class ExtendedSummarize {
  constructor () {
    this.registerMetrics()
  }

  registerMetrics () {
    this.metrics = {
      githubRepoSizeGauge: new Prometheus.Gauge({
        name: 'github_repo_size_kb',
        help: 'size for given repository',
        labelNames: ['owner', 'repository']
      }),
      githubRepoNetworkGauge: new Prometheus.Gauge({
        name: 'github_repo_network_total',
        help: 'network size for given repository',
        labelNames: ['owner', 'repository']
      })
    }
  }

  scrapeRepositories (repositories) {
    repositories.forEach((repository) => {
      const [owner, repo] = repository.split('/')

      ghRestApi.repos
        .get({ owner, repo })
        .then((response) => {
          this.metrics.githubRepoSizeGauge.set({ owner, repository }, response.data.size)
          this.metrics.githubRepoNetworkGauge.set(
            { owner, repository },
            response.data.network_count
          )
        })
        .catch((err) =>
          logger.error(`Failed to scrape repository ${repository} via REST: ${err.message}`, err)
        )
    })
  }
}

module.exports = ExtendedSummarize
