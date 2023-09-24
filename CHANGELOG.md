# [1.7.0](https://github.com/jkroepke/github_exporter/compare/v1.6.7...v1.7.0) (2023-09-24)


### Bug Fixes

* **ci:** docker flow ([4ab4da3](https://github.com/jkroepke/github_exporter/commit/4ab4da37c73c026937f6d1e762bb75f22d59bab1))


### Features

* bump dependencies ([6188b14](https://github.com/jkroepke/github_exporter/commit/6188b14c1b1452b956e279a49843740a65ed1c83))

## [1.6.7](https://github.com/jkroepke/github_exporter/compare/v1.6.6...v1.6.7) (2023-09-24)


### Bug Fixes

* **ci:** fix node version ([d2b8915](https://github.com/jkroepke/github_exporter/commit/d2b89157ec4e0f24d74fe352a2cf8eecd8bce280))
* popular content and referrer views metrics ([#158](https://github.com/jkroepke/github_exporter/issues/158)) ([40ee233](https://github.com/jkroepke/github_exporter/commit/40ee233af0666d7318546c4913c8b356f391401c))

## [1.6.6](https://github.com/jkroepke/github_exporter/compare/v1.6.5...v1.6.6) (2022-11-03)


### Bug Fixes

* remove strict flags from args parse ([31d826c](https://github.com/jkroepke/github_exporter/commit/31d826c69872a956a7cc3a1609c75d498568a69d))

## [1.6.5](https://github.com/jkroepke/github_exporter/compare/v1.6.4...v1.6.5) (2022-11-03)


### Bug Fixes

* **ci:** docker builds again again again ([73396c2](https://github.com/jkroepke/github_exporter/commit/73396c23e54feb04022f9179a102968de12d66bd))

## [1.6.4](https://github.com/jkroepke/github_exporter/compare/v1.6.3...v1.6.4) (2022-11-03)


### Bug Fixes

* **ci:** docker builds again again ([090e5c9](https://github.com/jkroepke/github_exporter/commit/090e5c9ffe144879c78499d8ffc2d9363e00250c))

## [1.6.3](https://github.com/jkroepke/github_exporter/compare/v1.6.2...v1.6.3) (2022-11-03)


### Bug Fixes

* **ci:** docker builds again again ([c9b9f02](https://github.com/jkroepke/github_exporter/commit/c9b9f02da392258392acd3cae6bc907a890f70af))

## [1.6.2](https://github.com/jkroepke/github_exporter/compare/v1.6.1...v1.6.2) (2022-11-03)


### Bug Fixes

* **ci:** docker builds again ([4fbd8bf](https://github.com/jkroepke/github_exporter/commit/4fbd8bf3c62d7f621f0c2d9a14935bf5e1a533b5))
* **ci:** docker builds again ([2d11fb6](https://github.com/jkroepke/github_exporter/commit/2d11fb617d19008066ce1070aac1b0a28567b5cc))

## [1.6.1](https://github.com/jkroepke/github_exporter/compare/v1.6.0...v1.6.1) (2022-11-03)


### Bug Fixes

* **ci:** docker builds ([b53272e](https://github.com/jkroepke/github_exporter/commit/b53272ed5862c2402d3d6b9c4c6b8bc6445644bb))

# [1.6.0](https://github.com/jkroepke/github_exporter/compare/v1.5.0...v1.6.0) (2022-11-03)

#### Features

* Use node 18 as default
* Added metric `github_repo_collaborator_total`
* Added metric `github_repo_disk_usage`
* Added metric `github_repo_discussions_total`
* Added metric `github_repo_deployments_total`
* Added metric `github_repo_environments_total`
* Added metric `github_repo_mentionable_users_total`
* Added metric `github_repo_collaborators_total`
* Added metric `github_repo_milestones_total`
* Added metric `github_repo_milestone_percent`
* Added metric `github_repo_milestone_state`
* Added metric `github_repo_milestone_issues_total`
* Remove metric `github_repo_size_kb`
* Remove metric `github_repo_network_total`
* Support GitHub app auth
* Support GitHub oauth app auth

# [1.5.0](https://github.com/jkroepke/github_exporter/compare/v1.4.2...v1.5.0) (2022-10-14)


### Bug Fixes

* split info metrics into single metrics instead labels ([7b38b49](https://github.com/jkroepke/github_exporter/commit/7b38b495e5bfa83d1bd73094184b88b0f3348ab9))
* traffic metrics ([805785b](https://github.com/jkroepke/github_exporter/commit/805785bec1bdb3b3554f75822451008090bebf92))
* traffic metrics again ([4aa20a1](https://github.com/jkroepke/github_exporter/commit/4aa20a17cbef2cf8a3b58d4ad0240be20609b53b))
* traffic metrics again again ([4d752ce](https://github.com/jkroepke/github_exporter/commit/4d752cee62098af69ac30b4dd825ac1dbbadcd4e))


### Features

* implement config file ([674ea0d](https://github.com/jkroepke/github_exporter/commit/674ea0dff66411dffdba122eb5f18e39988e4538))


### Reverts

* "refactor: use graphql for contributors metric" ([6a7528f](https://github.com/jkroepke/github_exporter/commit/6a7528f252c270a06a689aa35317c33dce11b3be))

## [1.4.2](https://github.com/jkroepke/github_exporter/compare/v1.4.1...v1.4.2) (2020-02-09)


### Bug Fixes

* fix trafic metrics doesnt use latest metrics ([c3fb4f9](https://github.com/jkroepke/github_exporter/commit/c3fb4f9001d904472e7f5dac28889acdd8b152a7))

## [1.4.1](https://github.com/jkroepke/github_exporter/compare/v1.4.0...v1.4.1) (2020-02-08)


### Bug Fixes

* grafana needs ms timestamp ([8bb0b92](https://github.com/jkroepke/github_exporter/commit/8bb0b92248133c59c5678f77c187d325664f1fe7))
* return metrics only on GET /metrics ([81d614c](https://github.com/jkroepke/github_exporter/commit/81d614c1e394df7cf492c673a38c47c752e26555))

# [1.4.0](https://github.com/jkroepke/github_exporter/compare/v1.3.0...v1.4.0) (2020-02-08)


### Features

* implement owner label on all labels ([6b9e0d0](https://github.com/jkroepke/github_exporter/commit/6b9e0d0274eaba1cd08bf2002d27a8ae6f1322af))

# [1.3.0](https://github.com/jkroepke/github_exporter/compare/v1.2.0...v1.3.0) (2020-02-08)


### Features

* implement language sizes ([f61da83](https://github.com/jkroepke/github_exporter/commit/f61da83d2e5e33f4b49af5edaf6e5a0ccd9a9af9))

# [1.2.0](https://github.com/jkroepke/github_exporter/compare/v1.1.2...v1.2.0) (2020-02-08)


### Features

* implement scrape all repos from user argument ([cace21f](https://github.com/jkroepke/github_exporter/commit/cace21f7703849057196aa65e6938ad8a368a8c5))

## [1.1.2](https://github.com/jkroepke/github_exporter/compare/v1.1.1...v1.1.2) (2020-02-08)


### Bug Fixes

* add missing changes from last commit (move graphql queries into templates and helpers) ([832e3c6](https://github.com/jkroepke/github_exporter/commit/832e3c622b7ec89df051d15611490cae6c1c899a))
