const { Octokit } = require('@octokit/rest')
const { throttling } = require('@octokit/plugin-throttling')

const { version } = require('../../package.json')
const { argv } = require('../args')
const logger = require('../logger')

const options = {
  auth: argv.auth,
  userAgent: `github_exporter/${version} (jkroepke/github_exporter; +https://github.com/jkroepke/github_exporter)`,
  log: {
    debug: (message) => logger.debug(message),
    info: (message) => logger.verbose(message),
    warn: (message) => logger.warn(message),
    error: (message) => logger.error(message)
  },
  throttle: {
    onRateLimit: (retryAfter, options, octokit, retryCount) => {
      octokit.log.warn(
        `Request quota exhausted for request ${options.method} ${options.url}`
      )

      if (retryCount < 1) {
        // only retries once
        octokit.log.info(`Retrying after ${retryAfter} seconds!`)
        return true
      }
    },
    onSecondaryRateLimit: (retryAfter, options, octokit) => {
      // does not retry, only logs a warning
      octokit.log.warn(
        `SecondaryRateLimit detected for request ${options.method} ${options.url}`
      )
    }
  }
}

switch (argv.authStrategy) {
  case 'action': {
    const { createActionAuth } = require('@octokit/auth-action')
    options.authStrategy = createActionAuth
    break
  }
  case 'oauth-app': {
    const { createOAuthAppAuth } = require('@octokit/auth-oauth-app')
    options.authStrategy = createOAuthAppAuth
    break
  }
  case 'app': {
    const { createAppAuth } = require('@octokit/auth-app')
    options.authStrategy = createAppAuth
    break
  }
  case 'token':
  default:
    break
}

const octokit = new (Octokit.plugin(throttling))(options)

module.exports = octokit
