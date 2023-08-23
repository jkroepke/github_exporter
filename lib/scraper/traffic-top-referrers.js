const Prometheus = require('prom-client')
const ghRestApi = require('../github/rest')
const logger = require('../logger')

class TrafficTopReferrers {
  constructor () {
    this.registerMetrics()
  }

  registerMetrics () {
    this.metrics = {
      githubRepoReferrerViewsGauge: new Prometheus.Gauge({
        name: 'github_repo_traffic_referring_sites_views',
        help: 'Total views from top 10 referrer for given repository',
        labelNames: ['owner', 'repository', 'referrer']
      }),
      githubRepoReferrerViewsUniqueGauge: new Prometheus.Gauge({
        name: 'github_repo_traffic_referring_sites_unique_vistors',
        help: 'Total unique visitors from top 10 referrers for given repository',
        labelNames: ['owner', 'repository', 'referrer']
      })
    }
  }

  scrapeRepositories (repositories) {
    this.metrics.githubRepoReferrerViewsGauge.reset()
    this.metrics.githubRepoReferrerViewsUniqueGauge.reset()
    repositories.forEach((repository) => {
      const [owner, repo] = repository.split('/')
      ghRestApi.repos
        .getTopReferrers({ owner, repo })
        .then((response) => {
          response.data.forEach((referrer) => {
            this.metrics.githubRepoReferrerViewsGauge.set(
              { owner, repository, referrer: referrer.referrer },
              referrer.count
            )
            this.metrics.githubRepoReferrerViewsUniqueGauge.set(
              { owner, repository, referrer: referrer.referrer },
              referrer.uniques
            )
          })
        })
        .catch((err) =>
          logger.error(
            `Failed to scrape referrer metrics for repository ${repository} via REST: ${err.message}`,
            err
          )
        )
    })
  }
}

module.exports = TrafficTopReferrers
