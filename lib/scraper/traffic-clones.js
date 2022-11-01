const Prometheus = require('prom-client')
const ghRestApi = require('../github/rest')
const logger = require('../logger')
const helpers = require('../helpers')

class TrafficClones {
  constructor () {
    this.registerMetrics()
  }

  registerMetrics () {
    this.metrics = {
      githubRepoClonesGauge: new Prometheus.Gauge({
        name: 'github_repo_traffic_clones',
        help: 'Total number of clones for given repository',
        labelNames: ['owner', 'repository', 'week']
      }),
      githubRepoClonesUniqueGauge: new Prometheus.Gauge({
        name: 'github_repo_traffic_unique_clones',
        help: 'Total number of clones for given repository',
        labelNames: ['owner', 'repository', 'week']
      }),
      githubRepoClonesAvgGauge: new Prometheus.Gauge({
        name: 'github_repo_traffic_clones_avg',
        help: 'Avenge number of clones for given repository',
        labelNames: ['owner', 'repository']
      }),
      githubRepoClonesUniqueAvgGauge: new Prometheus.Gauge({
        name: 'github_repo_traffic_unique_clones_avg',
        help: 'Avenge number of clones for given repository',
        labelNames: ['owner', 'repository']
      })
    }
  }

  scrapeRepositories (repositories) {
    repositories.forEach((repository) => {
      const [owner, repo] = repository.split('/')

      ghRestApi.repos
        .getClones({ owner, repo, per: 'week' })
        .then((response) => {
          this.metrics.githubRepoClonesAvgGauge.set({ owner, repository }, response.data.count)
          this.metrics.githubRepoClonesUniqueAvgGauge.set(
            { owner, repository },
            response.data.uniques
          )

          const currentWeekNumber = helpers.getWeekNumber(new Date())

          const currentWeek = response.data.clones.filter(
            (metric) => currentWeekNumber === helpers.getWeekNumber(new Date(metric.timestamp))
          )

          this.metrics.githubRepoClonesGauge.set(
            { owner, repository, week: 'latest' },
            currentWeek.length > 0 ? currentWeek[0].count : 0
          )
          this.metrics.githubRepoClonesUniqueGauge.set(
            { owner, repository, week: 'latest' },
            currentWeek.length > 0 ? currentWeek[0].uniques : 0
          )

          response.data.clones
            .filter(
              (metric) => currentWeekNumber !== helpers.getWeekNumber(new Date(metric.timestamp))
            )
            .forEach((metric) => {
              const weekNumber = helpers.getWeekNumber(new Date(metric.timestamp))
              this.metrics.githubRepoClonesGauge.set(
                { owner, repository, week: weekNumber },
                metric.count
              )
              this.metrics.githubRepoClonesUniqueGauge.set(
                { owner, repository, week: weekNumber },
                metric.uniques
              )
            })
        })
        .catch((err) =>
          logger.error(
            `Failed to scrape clone metrics for repository ${repository} via REST: ${err.message}`,
            err
          )
        )
    })
  }
}

module.exports = TrafficClones
