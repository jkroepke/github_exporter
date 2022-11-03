const { graphql } = require('@octokit/graphql')

const { version } = require('../../package.json')
const { argv } = require('../args')

const defaults = {
  headers: {
    'user-agent': `jkroepke/github_exporter v${version}`
  },
  mediaType: {
    previews: [
      'packages',
      'hawkgirl', // Dependency Graph GraphQL API
      'vixen' // Repository Vulnerability Alerts GraphQL API
    ]
  }
}

switch (argv.authStrategy) {
  case 'action': {
    const { createActionAuth } = require('@octokit/auth-action')
    defaults.request.hook = createActionAuth(argv.auth)
    break
  }
  case 'oauth-app': {
    const { createOAuthAppAuth } = require('@octokit/auth-oauth-app')
    defaults.request.hook = createOAuthAppAuth(argv.auth)
    break
  }
  case 'app': {
    const { createAppAuth } = require('@octokit/auth-app')
    defaults.request.hook = createAppAuth(argv.auth)
    break
  }
  case 'token': {
    defaults.headers.authorization = `token ${argv.auth}`
    break
  }
  default:
    break
}

module.exports = graphql.defaults(defaults)
