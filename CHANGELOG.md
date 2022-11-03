# [1.6.0](https://github.com/jkroepke/github_exporter/compare/v1.5.0...v1.6.0) (2022-11-03)


### Bug Fixes

* ci ([1e26f1f](https://github.com/jkroepke/github_exporter/commit/1e26f1fe437117613daa4eb8658450daba51c6d0))
* ci ([3f66215](https://github.com/jkroepke/github_exporter/commit/3f6621510fa0ad51f61106ae7841183cf85c0b48))
* ci ([04f3cb1](https://github.com/jkroepke/github_exporter/commit/04f3cb1b6f3e14f9719d705e1e1f024018359c48))
* ci ([1b0963b](https://github.com/jkroepke/github_exporter/commit/1b0963b23bdde93d57803afeec6e97d229d180b2))
* ci ([fb39919](https://github.com/jkroepke/github_exporter/commit/fb39919efbe1943309377aadfb4b9a86c3ba319e))
* ci ([35070c8](https://github.com/jkroepke/github_exporter/commit/35070c8d974749440f6bf31a285a63f41290364d))
* ci ([77c295a](https://github.com/jkroepke/github_exporter/commit/77c295a9ec12fb51cdf88244066489a70492e85c))
* ci ([fba9ce0](https://github.com/jkroepke/github_exporter/commit/fba9ce059caf674b91b709a48f4b4369f3bdd39f))
* ci ([ee4caca](https://github.com/jkroepke/github_exporter/commit/ee4cacaeb15f1a10e9b54a6ea74c07c03417ed00))
* **ci:** docker builds ([99cc21c](https://github.com/jkroepke/github_exporter/commit/99cc21c2b6dd708fca769015935b0c78a51e8878))
* husky ([646c3ac](https://github.com/jkroepke/github_exporter/commit/646c3ac49564f71f05a12227c46c980200997ee8))


### Features

* implement collaborators ([1e2b0c0](https://github.com/jkroepke/github_exporter/commit/1e2b0c040d68d9daeb2532a059002198b2098fc8))
* implement multiple auth strategies ([7101509](https://github.com/jkroepke/github_exporter/commit/7101509bd397454a3f37f39454428e8ede425eaa))

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
