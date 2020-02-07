
![NPM](https://img.shields.io/npm/l/github_exporter)
![npm](https://img.shields.io/npm/v/github_exporter)
![npm](https://img.shields.io/npm/dm/github_exporter)
![Docker Pulls](https://img.shields.io/docker/pulls/jkroepke/github_exporter)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/github_exporter)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/github_exporter)
[![Maintainability](https://api.codeclimate.com/v1/badges/c0b5bc1d4725a1b6bd8c/maintainability)](https://codeclimate.com/github/jkroepke/github_exporter/maintainability)
[![codecov](https://codecov.io/gh/jkroepke/github_exporter/branch/master/graph/badge.svg)](https://codecov.io/gh/jkroepke/github_exporter)

# github_exporter
Export various metrics including insights about github repositories from the GitHub API,
to a Prometheus compatible endpoint.


## Usage

```
index.js -t <token> -i 600 [ -s ] [ -l :=] [ -p 9171 ] [ -o organization ] [ -r owner/repository ]

Scape settings:
  --interval, -i  scrape interval  [number] [default=300]
  --spread, -s    spread request over interval  [boolean] [default=false]
  --scraper, -S   enable or disable scraper  [array] [default=["summarize","extended-summarize","rate-limit","contributors","status","traffic-clones","traffic-top-paths","traffic-top-referrers","traffic-views"]]

Scape targets:
  --organization, -o  GitHub organization to scrape. Can be defined multiple times or comma separated list  [array] [default=[]]
  --repository, -r    GitHub repositories to scrape. Can be defined multiple times or comma separated list. Format=<owner>/<repo>  [array] [default=[]]

Bind options:
  --host      address to bind exporter  [default="::"]
  --port, -p  port to bind exporter  [number] [default=9171]

Log options:
  --log-level    log level of application  [choices="error", "warn", "info", "http", "verbose", "debug", "silly"] [default="info"]
  --log-file     path to log file
  --log-console  log to console  [boolean] [default=true]
  --log-format   log format of application  [default="cli"]

Options:
  --version    Show version number  [boolean]
  --token, -t  GitHub Personal access token  [required]
  --help, -h   Show help  [boolean]

Environment variable support. Prefix=GITHUB_EXPORTER, e.g. --token == GITHUB_EXPORTER_TOKEN

for more information, find our manual at https://github.com/jkroepke/github_exporter
```
### GitHub Token

A Github token is highly recommend.

How to get an token=https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line#creating-a-token

More information:
- https://developer.github.com/v3/#authentication
- https://developer.github.com/v4/guides/forming-calls/#authenticating-with-graphql

## Start the exporter

Manually docker:

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

## Metrics

```
# HELP github_repo_scraped Successfully scraped a repository
# TYPE github_repo_scraped gauge
# HELP github_repo_info Information about given repository
# TYPE github_repo_info gauge
# HELP github_repo_issues_total Issues for given repository
# TYPE github_repo_issues_total gauge
# HELP github_repo_pull_request_total Pull requests for given repository
# TYPE github_repo_pull_request_total gauge
# HELP github_repo_watchers_total Total number of watchers/subscribers for given repository
# TYPE github_repo_watchers_total gauge
# HELP github_repo_stars_total Total number of Stars for given repository
# TYPE github_repo_stars_total gauge
# HELP github_repo_fork_total Total number of forks for given repository
# TYPE github_repo_fork_total gauge
# HELP github_repo_commits Total number of commits for given repository
# TYPE github_repo_commits gauge
# HELP github_repo_tags_total Total number of tags for given repository
# TYPE github_repo_tags_total gauge
# HELP github_repo_branches_total Total number of branches for given repository
# TYPE github_repo_branches_total gauge
# HELP github_repo_packages Total number of packages for given repository
# TYPE github_repo_packages gauge
# HELP github_repo_downloads Total number of releases for given repository
# TYPE github_repo_downloads gauge
# HELP github_repo_releases Total number of releases for given repository
# TYPE github_repo_releases gauge
# HELP github_repo_network_total network size for given repository
# TYPE github_repo_network_total gauge
# HELP github_rate_limit_limit GitHub API rate limit limit
# TYPE github_rate_limit_limit gauge
# HELP github_rate_limit_remaining GitHub API rate limit remaining
# TYPE github_rate_limit_remaining gauge
# HELP github_rate_limit_reset GitHub API rate limit reset
# TYPE github_rate_limit_reset gauge
# HELP github_repo_contributors Total number of releases for given repository
# TYPE github_repo_contributors gauge
# HELP github_repo_status status for the default branch for given repository
# TYPE github_repo_status gauge
# HELP github_repo_traffic_clones Total number of clones for given repository
# TYPE github_repo_traffic_clones gauge
# HELP github_repo_traffic_unique_clones Total number of clones for given repository
# TYPE github_repo_traffic_unique_clones gauge
# HELP github_repo_traffic_popular_content_views Total views from top 10 content for given repository
# TYPE github_repo_traffic_popular_content_views gauge
# HELP github_repo_traffic_popular_content_unique_vistors Total unique views from top 10 content for given repository
# TYPE github_repo_traffic_popular_content_unique_vistors gauge
# HELP github_repo_traffic_referring_sites_views Total views from top 10 referrer for given repository
# TYPE github_repo_traffic_referring_sites_views gauge
# HELP github_repo_traffic_referring_sites_unique_vistors Total unique visitors from top 10 referrers for given repository
# TYPE github_repo_traffic_referring_sites_unique_vistors gauge
# HELP github_repo_traffic_views Total views from top 10 content for given repository
# TYPE github_repo_traffic_views gauge
# HELP github_repo_traffic_unique_vistors Total unique views from top 10 content for given repository
# TYPE github_repo_traffic_unique_vistors gauge
```

## Authors
* [Jan-Otto Kröpke](https://github.com/jkroepke)

## License

MIT Licence
