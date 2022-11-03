const Prometheus = require('prom-client')
const fs = require('fs')
const ghRestApi = require('../github/rest')
const graphql = require('../github/graphql')
const logger = require('../logger')
const helpers = require('../helpers')

const maxRepositoriesPerScrape = 100

class Status {
  constructor () {
    this.registerMetrics()
    this.loadQueryTemplate()
  }

  registerMetrics () {
    this.metrics = {
      githubRepoStatusGauge: new Prometheus.Gauge({
        name: 'github_repo_status',
        help: 'status for the default branch for given repository',
        labelNames: ['owner', 'repository', 'context']
      })
    }
  }

  loadQueryTemplate () {
    this.graphqlQuery = fs.readFileSync('./templates/graphql/default-ref.graphql', 'utf8')
  }

  scrapeRepositories (repositories) {
    const repositoryChunks = helpers.splitArray(repositories, maxRepositoriesPerScrape)

    repositoryChunks.forEach((repositoryChunk) => {
      graphql(this.getQuery(repositoryChunk))
        .then((response) => {
          repositoryChunk.forEach((repository) => {
            const repoLabel = `repo_${helpers.transformRepositoryNameToGraphQlLabel(repository)}`

            if (!(repoLabel in response)) {
              logger.error(`Can't find metrics for repository ${repository} in response.`)
            }

            if (response[repoLabel].defaultBranchRef === null) return

            this.scrapeStatus(repository, response[repoLabel].defaultBranchRef.name)
          })
        })
        .catch((err) => {
          logger.error(
            `Failed get status from repository ${repositories.join(', ')}: `,
            err
          )
        })
    })
  }

  scrapeStatus (repository, defaultBranch) {
    const [owner, repo] = repository.split('/')

    ghRestApi.repos
      .getCombinedStatusForRef({ owner, repo, ref: defaultBranch })
      .then((response) => {
        this.metrics.githubRepoStatusGauge.reset()

        response.data.statuses.forEach((status) => {
          this.metrics.githubRepoStatusGauge.set(
            { owner, repository, context: status.context },
            Status.stateToMetric(status.state)
          )
        })
      })
      .catch((err) =>
        logger.error(
          `Failed to scrape status from repository ${repository} via REST: ${err.message}`,
          err
        )
      )
  }

  static stateToMetric (state) {
    const map = {
      success: 0,
      error: 1,
      failure: 2,
      pending: 3
    }

    if (state in map) {
      return map[state]
    }

    return -1
  }

  getQuery (repositories) {
    return [
      this.graphqlQuery,
      '{',
      helpers.generateGraphqlRepositoryQueries(repositories),
      '}'
    ].join('\n')
  }
}

module.exports = Status
