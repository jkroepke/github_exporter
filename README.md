[![NPM](https://img.shields.io/npm/l/github_exporter)](https://www.npmjs.com/package/github_exporter)
[![CI](https://github.com/jkroepke/github_exporter/workflows/CI/badge.svg)](https://github.com/jkroepke/github_exporter)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

[![npm](https://img.shields.io/npm/v/github_exporter)](https://www.npmjs.com/package/github_exporter)
[![npm](https://img.shields.io/npm/dm/github_exporter)](https://www.npmjs.com/package/github_exporter)
[![Docker Pulls](https://img.shields.io/docker/pulls/jkroepke/github_exporter)](https://hub.docker.com/r/jkroepke/github_exporter)

[![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/github_exporter)](https://libraries.io/github/jkroepke/github_exporter)
[![Known Vulnerabilities](https://snyk.io/test/github/jkroepke/github_exporter/badge.svg?targetFile=package.json)](https://snyk.io/test/github/jkroepke/github_exporter?targetFile=package.json)
[![Maintainability](https://api.codeclimate.com/v1/badges/c0b5bc1d4725a1b6bd8c/maintainability)](https://codeclimate.com/github/jkroepke/github_exporter/maintainability)
[![codecov](https://codecov.io/gh/jkroepke/github_exporter/branch/master/graph/badge.svg)](https://codecov.io/gh/jkroepke/github_exporter)

# github_exporter
Export various metrics including insights and traffic metrics about github repositories from the GitHub API,
to a Prometheus compatible endpoint.

## About rate limits and abuse warnings

[github_exporter](https://github.com/jkroepke/github_exporter) use GitHub [GraphQL API V4](https://developer.github.com/v4/) and [REST API V3](https://developer.github.com/v3/).

Both APIs have a separate rate-limit. The default limit is 5000 requests/hour with an personal access token.

To prevent rate limit or abuse errors I highly recommend to configure a higher scrape interval.
If you are still in trouble you also should enable the spread parameter to spread requests across the
scrape interval.

More information:
* https://developer.github.com/v3/#rate-limiting
* https://developer.github.com/v4/guides/resource-limitations/

### GitHub Token

A Github token is highly recommend.

How to get an token: https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line#creating-a-token

More information:
- https://developer.github.com/v3/#authentication
- https://developer.github.com/v4/guides/forming-calls/#authenticating-with-graphql

## Usage

```
index.js -t <token> -i 600 [ -s ] [ -l :: ] [ -p 9171 ] [ -o organization ] [ -u user ] [ -r owner/repository ]

Scape settings:
  --interval, -i  scrape interval  [number] [default: 600]
  --spread, -s    spread request over interval  [boolean] [default: false]
  --scraper, -S   enable or disable scraper  [array] [default: ["summarize","extended-summarize","rate-limit","contributors","status","traffic-clones","traffic-top-paths","traffic-top-referrers","traffic-views"]]

Scape targets:
  --organization, -o  GitHub organization to scrape. Can be defined multiple times or comma separated list  [array] [default: []]
  --user, -u          GitHub users to scrape. Can be defined multiple times or comma separated list  [array] [default: []]
  --repository, -r    GitHub repositories to scrape. Can be defined multiple times or comma separated list. Format: <owner>/<repo>  [array] [default: []]

Bind options:
  --host      address to bind exporter  [default: "::"]
  --port, -p  port to bind exporter  [number] [default: 9171]

Log options:
  --log-level    log level of application  [choices: "error", "warn", "info", "http", "verbose", "debug", "silly"] [default: "info"]
  --log-file     path to log file
  --log-console  log to console  [boolean] [default: true]
  --log-format   log format of application  [default: "cli"]

Options:
  --version    Show version number  [boolean]
  --token, -t  GitHub Personal access token  [required]
  --help, -h   Show help  [boolean]

Environment variable support. Prefix: GITHUB_EXPORTER, e.g. --token == GITHUB_EXPORTER_TOKEN

for more information, find our manual at https://github.com/jkroepke/github_exporter
```

### .env file config
If case you don't want to define certain options like secrets you can define
them in a `.env` file.

More information about `.env` file:
- https://github.com/motdotla/dotenv#usage

## Start the exporter

### Docker:

```bash
docker run --name github_exporter -d \
    --restart=always -p 9171:9171 \
    -e GITHUB_EXPORTER_TOKEN=<secret> \
    -e GITHUB_EXPORTER_ORGANIZATION=org1,org2 \
    -e GITHUB_EXPORTER_USER=user1,user2 \
    -e GITHUB_EXPORTER_REPOSITORY=jkroepke/github_exporter,jkroepke/2Moons \
    jkroepke/github-exporter
```

A [compose file](./docker-compose.yml) is available, too.

### node package manager
```bash
npm install -g github_exporter

github_exporter --token --repository=kroepke/github_exporter
```

## Metrics

```
# HELP github_repo_scraped Successfully scraped a repository
# TYPE github_repo_scraped gauge
github_repo_scraped{owner="jkroepke",repository="jkroepke/github_exporter"} 1
# HELP github_repo_info Information about given repository
# TYPE github_repo_info gauge
github_repo_info{owner="jkroepke",repository="jkroepke/github_exporter",forked="false",disabled="false",archived="false",template="false",licence="MIT License",created_at="1580644595",updated_at="1581162792",language="JavaScript",has_issues="true",has_projects="true",has_wiki="true"} 1
# HELP github_repo_issues_total Issues for given repository
# TYPE github_repo_issues_total gauge
github_repo_issues_total{owner="jkroepke",repository="jkroepke/github_exporter",status="open"} 0
# HELP github_repo_pull_request_total Pull requests for given repository
# TYPE github_repo_pull_request_total gauge
github_repo_pull_request_total{owner="jkroepke",repository="jkroepke/github_exporter",status="open"} 0
# HELP github_repo_watchers_total Total number of watchers/subscribers for given repository
# TYPE github_repo_watchers_total gauge
github_repo_watchers_total{owner="jkroepke",repository="jkroepke/github_exporter"} 1
# HELP github_repo_stars_total Total number of Stars for given repository
# TYPE github_repo_stars_total gauge
github_repo_stars_total{owner="jkroepke",repository="jkroepke/github_exporter"} 0
# HELP github_repo_fork_total Total number of forks for given repository
# TYPE github_repo_fork_total gauge
github_repo_fork_total{owner="jkroepke",repository="jkroepke/github_exporter"} 0
# HELP github_repo_commits Total number of commits for given repository
# TYPE github_repo_commits gauge
github_repo_commits{owner="jkroepke",repository="jkroepke/github_exporter"} 50
# HELP github_repo_tags_total Total number of tags for given repository
# TYPE github_repo_tags_total gauge
github_repo_tags_total{owner="jkroepke",repository="jkroepke/github_exporter"} 6
# HELP github_repo_branches_total Total number of branches for given repository
# TYPE github_repo_branches_total gauge
github_repo_branches_total{owner="jkroepke",repository="jkroepke/github_exporter"} 1
# HELP github_repo_packages Total number of packages for given repository
# TYPE github_repo_packages gauge
github_repo_packages{owner="jkroepke",repository="jkroepke/github_exporter"} 0
# HELP github_repo_downloads Total number of releases for given repository
# TYPE github_repo_downloads gauge
# HELP github_repo_releases Total number of releases for given repository
# TYPE github_repo_releases gauge
github_repo_releases{owner="jkroepke",repository="jkroepke/github_exporter"} 5
# HELP github_repo_vulnerabilities_total vulnerabilities for given repository
# TYPE github_repo_vulnerabilities_total gauge
github_repo_vulnerabilities_total{owner="jkroepke",repository="jkroepke/github_exporter"} 0
# HELP github_repo_languages_size return repo size by langauges for given repository
# TYPE github_repo_languages_size gauge
github_repo_languages_size{owner="jkroepke",repository="jkroepke/github_exporter",language="JavaScript"} 31408
# HELP github_repo_size_kb size for given repository
# TYPE github_repo_size_kb gauge
github_repo_size_kb{owner="jkroepke",repository="jkroepke/github_exporter"} 895
# HELP github_repo_network_total network size for given repository
# TYPE github_repo_network_total gauge
github_repo_network_total{owner="jkroepke",repository="jkroepke/github_exporter"} 0
# HELP github_rate_limit_limit GitHub API rate limit limit
# TYPE github_rate_limit_limit gauge
github_rate_limit_limit{api="core"} 5000
# HELP github_rate_limit_remaining GitHub API rate limit remaining
# TYPE github_rate_limit_remaining gauge
github_rate_limit_remaining{api="core"} 4954
# HELP github_rate_limit_reset GitHub API rate limit reset
# TYPE github_rate_limit_reset gauge
github_rate_limit_reset{api="core"} 1581168819
# HELP github_repo_contributors Total number of releases for given repository
# TYPE github_repo_contributors gauge
github_repo_contributors{owner="jkroepke",repository="jkroepke/github_exporter"} 2
# HELP github_repo_status status for the default branch for given repository
# TYPE github_repo_status gauge
github_repo_status{owner="jkroepke",repository="jkroepke/github_exporter",context="ci/dockercloud"} 0
# HELP github_repo_traffic_clones Total number of clones for given repository
# TYPE github_repo_traffic_clones gauge
github_repo_traffic_clones{owner="jkroepke",repository="jkroepke/github_exporter"} 66
# HELP github_repo_traffic_unique_clones Total number of clones for given repository
# TYPE github_repo_traffic_unique_clones gauge
github_repo_traffic_unique_clones{owner="jkroepke",repository="jkroepke/github_exporter"} 14
# HELP github_repo_traffic_popular_content_views Total views from top 10 content for given repository
# TYPE github_repo_traffic_popular_content_views gauge
github_repo_traffic_popular_content_views{owner="jkroepke",repository="jkroepke/github_exporter",path="/jkroepke/github_exporter/tree/master/lib"} 2
# HELP github_repo_traffic_popular_content_unique_vistors Total unique views from top 10 content for given repository
# TYPE github_repo_traffic_popular_content_unique_vistors gauge
github_repo_traffic_popular_content_unique_vistors{owner="jkroepke",repository="jkroepke/github_exporter",path="/jkroepke/github_exporter/tree/master/lib"} 1
# HELP github_repo_traffic_referring_sites_views Total views from top 10 referrer for given repository
# TYPE github_repo_traffic_referring_sites_views gauge
# HELP github_repo_traffic_referring_sites_unique_vistors Total unique visitors from top 10 referrers for given repository
# TYPE github_repo_traffic_referring_sites_unique_vistors gauge
# HELP github_repo_traffic_views Total views from top 10 content for given repository
# TYPE github_repo_traffic_views gauge
github_repo_traffic_views{owner="jkroepke",repository="jkroepke/github_exporter"} 9
# HELP github_repo_traffic_unique_vistors Total unique views from top 10 content for given repository
# TYPE github_repo_traffic_unique_vistors gauge
github_repo_traffic_unique_vistors{owner="jkroepke",repository="jkroepke/github_exporter"} 1
```

## Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md)

## Authors
* [Jan-Otto Kröpke](https://github.com/jkroepke)

## License

MIT Licence
