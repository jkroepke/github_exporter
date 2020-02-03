const transformRepositoryNameToLabel = (name) => name.replace(/[-/.]/g, '_');

const repositoryQuery = (repositories) => {
  const repositoryQueryParts = repositories.map((repository) => `
    repo_${transformRepositoryNameToLabel(repository)}: repository(owner: "${repository.split('/')[0]}", name: "${repository.split('/')[1]}") {
      ...repositoryFragment
    }`).join('\n\n');

  return `fragment repositoryFragment on Repository {
    name
    nameWithOwner
    owner {
      login
    }
    description
    createdAt
    updatedAt
    pushedAt
    isFork
    isDisabled
    isArchived
    isTemplate
    diskUsage
    hasWikiEnabled
    hasProjectsEnabled
    hasIssuesEnabled
    primaryLanguage {
      name
    }
    licenseInfo {
      name
    }
    forkCount
    dependencyGraphManifests(first: 0) {
      totalCount
    }
    packages(first: 0) {
      totalCount
    }
    stargazers(first: 0) {
      totalCount
    }
    watchers(first: 0) {
      totalCount
    }
    commits: object(expression: "master") {
      ... on Commit {
        history {
          totalCount
        }
      }
    }
    releases {
      totalCount
    }
    releases {
      nodes {
        tagName
        releaseAssets(first: 50) {
          nodes {
            downloadUrl
            downloadCount
          }
        }
      }
    }
    branchesTotalCount: refs(first: 0, refPrefix: "refs/heads/") {
      totalCount
    }
    tagsCount: refs(first: 0, refPrefix: "refs/tags/") {
      totalCount
    }
    pullRequestsOpenTotal: pullRequests(first: 0, states: OPEN) {
      totalCount
    }
    pullRequestsClosedTotal: pullRequests(first: 0, states: CLOSED) {
      totalCount
    }
    pullRequestsMergedTotal: pullRequests(first: 0, states: MERGED) {
      totalCount
    }
    issuesOpenTotal: issues(first: 0, states: OPEN) {
      totalCount
    }
    issuesClosedTotal: issues(first: 0, states: CLOSED) {
      totalCount
    }
  }
  
  {

${repositoryQueryParts}
  
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
  }`;
};

module.exports = {
  transformRepositoryNameToLabel,
  repositoryQuery,
};
