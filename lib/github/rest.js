const { Octokit } = require('@octokit/rest')

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

const octokit = new Octokit(options)

module.exports = octokit
