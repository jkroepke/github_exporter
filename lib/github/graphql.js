const { graphql } = require('@octokit/graphql');

const { version } = require('../../package.json');
const { argv } = require('../args');

module.exports = graphql.defaults({
  headers: {
    authorization: `token ${argv.token}`,
    'user-agent': `jkroepke/github_exporter v${version}`,
  },
  mediaType: {
    previews: [
      'packages',
      'hawkgirl', // Repositories Dependency Graph
    ],
  },
});
