import * as Prometheus from "prom-client";
import fs from "fs";
import graphql from "../github/graphql.js";
import logger from "../logger.js";
import * as helpers from "../helpers.js";

const maxRepositoriesPerScrape = 1;

interface RepositoryMetrics {
  licenseInfo: { name: string } | null;
  primaryLanguage: { name: string } | null;
  commits: { history: { totalCount: number } } | null;
  vulnerabilityAlerts: { totalCount: number } | null;
  isDisabled: boolean;
  isFork: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  hasIssuesEnabled: boolean;
  hasProjectsEnabled: boolean;
  hasWikiEnabled: boolean;
  isTemplate: boolean;
  stargazerCount: number;
  watchers: { totalCount: number };
  forkCount: number;
  issuesOpenTotal: { totalCount: number };
  issuesClosedTotal: { totalCount: number };
  pullRequestsOpenTotal: { totalCount: number };
  pullRequestsClosedTotal: { totalCount: number };
  pullRequestsMergedTotal: { totalCount: number };
  tagsTotalCount: { totalCount: number };
  branchesTotalCount: { totalCount: number };
  packages: { totalCount: number };
  releases: {
    totalCount: number;
    nodes: Array<{
      tagName: string;
      releaseAssets: {
        nodes: Array<{
          downloadUrl: string;
          downloadCount: number;
        }>;
      };
    }>;
  };
  diskUsage: number;
  discussions: { totalCount: number };
  deployments: { totalCount: number };
  environments: { totalCount: number };
  mentionableUsers: { totalCount: number };
  collaborators: { totalCount: number };
  milestones: {
    totalCount: number;
    nodes: Array<{
      title: string;
      number: number;
      state: string;
      progressPercentage: number;
      issues: { totalCount: number };
    }>;
  };
  languages: {
    edges: Array<{
      node: { name: string };
      size: number;
    }>;
  };
}

class Summarize {
  private metrics!: Record<string, Prometheus.Gauge<string>>;
  private graphqlQuery!: string;

  constructor() {
    this.registerMetrics();
    this.loadQueryTemplate();
  }

  registerMetrics(): void {
    this.metrics = {
      githubRepoScrapedGauge: new Prometheus.Gauge({
        name: "github_repo_scraped",
        help: "Successfully scraped a repository",
        labelNames: ["owner", "repository"],
      }),
      githubRepoInfoGauge: new Prometheus.Gauge({
        name: "github_repo_info",
        help: "Information about given repository",
        labelNames: ["owner", "repository", "licence", "language"],
      }),
      githubRepoIsDisabledGauge: new Prometheus.Gauge({
        name: "github_repo_is_disabled",
        help: "Is repository disabled",
        labelNames: ["owner", "repository"],
      }),
      githubRepoIsForkedGauge: new Prometheus.Gauge({
        name: "github_repo_is_fork",
        help: "Is repository a fork",
        labelNames: ["owner", "repository"],
      }),
      githubRepoIsArchivedGauge: new Prometheus.Gauge({
        name: "github_repo_is_archived",
        help: "Is repository archived",
        labelNames: ["owner", "repository"],
      }),
      githubRepoCreatedAtGauge: new Prometheus.Gauge({
        name: "github_repo_created_at",
        help: "repository creation date",
        labelNames: ["owner", "repository"],
      }),
      githubRepoUpdatedAtGauge: new Prometheus.Gauge({
        name: "github_repo_updated_at",
        help: "repository last update date",
        labelNames: ["owner", "repository"],
      }),
      githubRepoPushedAtGauge: new Prometheus.Gauge({
        name: "github_repo_pushed_at",
        help: "repository last push date",
        labelNames: ["owner", "repository"],
      }),
      githubRepoHasIssuesGauge: new Prometheus.Gauge({
        name: "github_repo_has_issues",
        help: "has repository issues enabled",
        labelNames: ["owner", "repository"],
      }),
      githubRepoHasProjectsGauge: new Prometheus.Gauge({
        name: "github_repo_has_projects",
        help: "has repository issues enabled",
        labelNames: ["owner", "repository"],
      }),
      githubRepoHasWikiGauge: new Prometheus.Gauge({
        name: "github_repo_has_wiki",
        help: "has repository issues enabled",
        labelNames: ["owner", "repository"],
      }),
      githubRepoIsTemplateGauge: new Prometheus.Gauge({
        name: "github_repo_is_template",
        help: "is repository a template",
        labelNames: ["owner", "repository"],
      }),
      githubRepoIssuesGauge: new Prometheus.Gauge({
        name: "github_repo_issues_total",
        help: "Issues for given repository",
        labelNames: ["owner", "repository", "status"],
      }),
      githubRepoPullRequestsGauge: new Prometheus.Gauge({
        name: "github_repo_pull_request_total",
        help: "Pull requests for given repository",
        labelNames: ["owner", "repository", "status"],
      }),
      githubRepoWatchersGauge: new Prometheus.Gauge({
        name: "github_repo_watchers_total",
        help: "Total number of watchers/subscribers for given repository",
        labelNames: ["owner", "repository"],
      }),
      githubRepoStarsGauge: new Prometheus.Gauge({
        name: "github_repo_stars_total",
        help: "Total number of Stars for given repository",
        labelNames: ["owner", "repository"],
      }),
      githubRepoForksGauge: new Prometheus.Gauge({
        name: "github_repo_fork_total",
        help: "Total number of forks for given repository",
        labelNames: ["owner", "repository"],
      }),
      githubRepoCommitsGauge: new Prometheus.Gauge({
        name: "github_repo_commits",
        help: "Total number of commits for given repository",
        labelNames: ["owner", "repository"],
      }),
      githubRepoTagsGauge: new Prometheus.Gauge({
        name: "github_repo_tags_total",
        help: "Total number of tags for given repository",
        labelNames: ["owner", "repository"],
      }),
      githubRepoBranchesGauge: new Prometheus.Gauge({
        name: "github_repo_branches_total",
        help: "Total number of branches for given repository",
        labelNames: ["owner", "repository"],
      }),
      githubRepoPackagesGauge: new Prometheus.Gauge({
        name: "github_repo_packages",
        help: "Total number of packages for given repository",
        labelNames: ["owner", "repository"],
      }),
      githubRepoDownloadsGauge: new Prometheus.Gauge({
        name: "github_repo_downloads",
        help: "Total number of releases for given repository",
        labelNames: ["owner", "repository", "release", "url"],
      }),
      githubRepoReleasesGauge: new Prometheus.Gauge({
        name: "github_repo_releases",
        help: "Total number of releases for given repository",
        labelNames: ["owner", "repository"],
      }),
      githubRepoDiskUsageGauge: new Prometheus.Gauge({
        name: "github_repo_disk_usage",
        help: "The number of kilobytes this repository occupies on disk.",
        labelNames: ["owner", "repository"],
      }),
      githubRepoDiscussionsGauge: new Prometheus.Gauge({
        name: "github_repo_discussions_total",
        help: "Total number of discussions for given repository",
        labelNames: ["owner", "repository"],
      }),
      githubRepoDeploymentsGauge: new Prometheus.Gauge({
        name: "github_repo_deployments_total",
        help: "Total number of deployments for given repository",
        labelNames: ["owner", "repository"],
      }),
      githubRepoEnvironmentsGauge: new Prometheus.Gauge({
        name: "github_repo_environments_total",
        help: "Total number of deployments for given repository",
        labelNames: ["owner", "repository"],
      }),
      githubRepoMentionableUsersGauge: new Prometheus.Gauge({
        name: "github_repo_mentionable_users_total",
        help: "Total number of mentionable users for given repository",
        labelNames: ["owner", "repository"],
      }),
      githubRepoCollaboratorsGauge: new Prometheus.Gauge({
        name: "github_repo_collaborators_total",
        help: "Total number of collaborators for given repository",
        labelNames: ["owner", "repository"],
      }),
      githubRepoMilestonesTotalGauge: new Prometheus.Gauge({
        name: "github_repo_milestones_total",
        help: "Total number of collaborators for given repository",
        labelNames: ["owner", "repository"],
      }),
      githubRepoMilestonesProgressPercentageGauge: new Prometheus.Gauge({
        name: "github_repo_milestone_percent",
        help: "Percent of milestone inside the given repository",
        labelNames: ["owner", "repository", "number", "title"],
      }),
      githubRepoMilestonesStateGauge: new Prometheus.Gauge({
        name: "github_repo_milestone_state",
        help: "State of milestone inside the given repository",
        labelNames: ["owner", "repository", "number", "title"],
      }),
      githubRepoMilestonesIssuesTotalGauge: new Prometheus.Gauge({
        name: "github_repo_milestone_issues_total",
        help: "Total issue count of milestone inside the given repository",
        labelNames: ["owner", "repository", "number", "title"],
      }),
      githubRepoVulnerabilitiesGauge: new Prometheus.Gauge({
        name: "github_repo_vulnerabilities_total",
        help: "vulnerabilities for given repository",
        labelNames: ["owner", "repository"],
      }),
      githubRepoLanguagesGauge: new Prometheus.Gauge({
        name: "github_repo_languages_size",
        help: "return repo size by langauges for given repository",
        labelNames: ["owner", "repository", "language"],
      }),
    };
  }

  loadQueryTemplate(): void {
    this.graphqlQuery = fs.readFileSync("./templates/graphql/summarize.graphql", "utf8");
  }

  async scrapeRepositoryChunk(repositoryChunk: string[]): Promise<void> {
    try {
      const response: any = await graphql(this.getQuery(repositoryChunk));

      repositoryChunk.forEach((repository) => {
        const repoLabel = `repo_${helpers.transformRepositoryNameToGraphQlLabel(repository)}`;

        if (!(repoLabel in response)) {
          logger.error(`Can't find metrics for repository ${repository} in response.`);
          return;
        }

        this.process(repository, response[repoLabel]);
      });
    } catch (err) {
      repositoryChunk.forEach((repository) =>
        this.metrics.githubRepoScrapedGauge.set(
          {
            owner: repository.split("/")[0],
            repository,
          },
          0,
        ),
      );

      logger.error(`Failed to scrape details from repository ${repositoryChunk.join(", ")}: `, err);
    }
  }

  scrapeRepositories(repositories: string[]): void {
    const repositoryChunks = helpers.splitArray(repositories, maxRepositoriesPerScrape);

    // Process chunks sequentially with a small delay to avoid overwhelming the API
    repositoryChunks.forEach((repositoryChunk, index) => {
      // Add 500ms delay between each batch to prevent rate limiting
      setTimeout(() => {
        void this.scrapeRepositoryChunk(repositoryChunk);
      }, index * 500);
    });
  }

  getQuery(repositories: string[]): string {
    return [
      this.graphqlQuery,
      "{",
      helpers.generateGraphqlRepositoryQueries(repositories),
      "}",
    ].join("\n");
  }

  process(repository: string, repositoryMetrics: RepositoryMetrics): void {
    const [owner] = repository.split("/");

    try {
      const licence = repositoryMetrics.licenseInfo
        ? repositoryMetrics.licenseInfo.name
        : "UNLICENSED";
      const language = repositoryMetrics.primaryLanguage
        ? repositoryMetrics.primaryLanguage.name
        : "UNKNOWN";

      const commitCount =
        repositoryMetrics.commits !== null ? repositoryMetrics.commits.history.totalCount : 0;

      const vulnerabilityAlerts =
        repositoryMetrics.vulnerabilityAlerts !== null
          ? repositoryMetrics.vulnerabilityAlerts.totalCount
          : -1;

      this.metrics.githubRepoInfoGauge.set({ owner, repository, licence, language }, 1);

      this.metrics.githubRepoIsDisabledGauge.set(
        { owner, repository },
        Number(repositoryMetrics.isDisabled),
      );
      this.metrics.githubRepoIsForkedGauge.set(
        { owner, repository },
        Number(repositoryMetrics.isFork),
      );
      this.metrics.githubRepoIsArchivedGauge.set(
        { owner, repository },
        Number(repositoryMetrics.isArchived),
      );
      this.metrics.githubRepoCreatedAtGauge.set(
        { owner, repository },
        Date.parse(repositoryMetrics.createdAt),
      );
      this.metrics.githubRepoUpdatedAtGauge.set(
        { owner, repository },
        Date.parse(repositoryMetrics.updatedAt),
      );
      this.metrics.githubRepoPushedAtGauge.set(
        { owner, repository },
        Date.parse(repositoryMetrics.pushedAt),
      );
      this.metrics.githubRepoHasIssuesGauge.set(
        { owner, repository },
        Number(repositoryMetrics.hasIssuesEnabled),
      );
      this.metrics.githubRepoHasProjectsGauge.set(
        { owner, repository },
        Number(repositoryMetrics.hasProjectsEnabled),
      );
      this.metrics.githubRepoHasWikiGauge.set(
        { owner, repository },
        Number(repositoryMetrics.hasWikiEnabled),
      );
      this.metrics.githubRepoIsTemplateGauge.set(
        { owner, repository },
        Number(repositoryMetrics.isTemplate),
      );
      this.metrics.githubRepoStarsGauge.set(
        { owner, repository },
        repositoryMetrics.stargazerCount,
      );
      this.metrics.githubRepoWatchersGauge.set(
        { owner, repository },
        repositoryMetrics.watchers.totalCount,
      );
      this.metrics.githubRepoForksGauge.set({ owner, repository }, repositoryMetrics.forkCount);
      this.metrics.githubRepoIssuesGauge.set(
        { owner, repository, status: "open" },
        repositoryMetrics.issuesOpenTotal.totalCount,
      );
      this.metrics.githubRepoIssuesGauge.set(
        { owner, repository, status: "closed" },
        repositoryMetrics.issuesClosedTotal.totalCount,
      );
      this.metrics.githubRepoPullRequestsGauge.set(
        { owner, repository, status: "open" },
        repositoryMetrics.pullRequestsOpenTotal.totalCount,
      );
      this.metrics.githubRepoPullRequestsGauge.set(
        { owner, repository, status: "closed" },
        repositoryMetrics.pullRequestsClosedTotal.totalCount,
      );
      this.metrics.githubRepoPullRequestsGauge.set(
        { owner, repository, status: "merged" },
        repositoryMetrics.pullRequestsMergedTotal.totalCount,
      );
      this.metrics.githubRepoCommitsGauge.set({ owner, repository }, commitCount);
      this.metrics.githubRepoTagsGauge.set(
        { owner, repository },
        repositoryMetrics.tagsTotalCount.totalCount,
      );
      this.metrics.githubRepoBranchesGauge.set(
        { owner, repository },
        repositoryMetrics.branchesTotalCount.totalCount,
      );
      this.metrics.githubRepoPackagesGauge.set(
        { owner, repository },
        repositoryMetrics.packages.totalCount,
      );
      this.metrics.githubRepoReleasesGauge.set(
        { owner, repository },
        repositoryMetrics.releases.totalCount,
      );
      this.metrics.githubRepoDiskUsageGauge.set({ owner, repository }, repositoryMetrics.diskUsage);
      this.metrics.githubRepoDiscussionsGauge.set(
        { owner, repository },
        repositoryMetrics.discussions.totalCount,
      );
      this.metrics.githubRepoDeploymentsGauge.set(
        { owner, repository },
        repositoryMetrics.deployments.totalCount,
      );
      this.metrics.githubRepoEnvironmentsGauge.set(
        { owner, repository },
        repositoryMetrics.environments.totalCount,
      );
      this.metrics.githubRepoMentionableUsersGauge.set(
        { owner, repository },
        repositoryMetrics.mentionableUsers.totalCount,
      );
      this.metrics.githubRepoCollaboratorsGauge.set(
        { owner, repository },
        repositoryMetrics.collaborators.totalCount,
      );
      this.metrics.githubRepoMilestonesTotalGauge.set(
        { owner, repository },
        repositoryMetrics.milestones.totalCount,
      );

      repositoryMetrics.releases.nodes.forEach((release) => {
        release.releaseAssets.nodes.forEach((asset) => {
          this.metrics.githubRepoDownloadsGauge.set(
            {
              owner,
              repository,
              release: release.tagName,
              url: asset.downloadUrl,
            },
            asset.downloadCount,
          );
        });
      });

      this.metrics.githubRepoVulnerabilitiesGauge.set({ owner, repository }, vulnerabilityAlerts);

      repositoryMetrics.languages.edges.forEach((languageDetail) => {
        this.metrics.githubRepoLanguagesGauge.set(
          {
            owner,
            repository,
            language: languageDetail.node.name,
          },
          languageDetail.size,
        );
      });

      repositoryMetrics.milestones.nodes.forEach((milestone) => {
        this.metrics.githubRepoMilestonesStateGauge.set(
          {
            owner,
            repository,
            title: milestone.title,
            number: milestone.number.toString(),
          },
          milestone.state === "OPEN" ? 0 : 1,
        );
        this.metrics.githubRepoMilestonesProgressPercentageGauge.set(
          {
            owner,
            repository,
            title: milestone.title,
            number: milestone.number.toString(),
          },
          milestone.progressPercentage,
        );
        this.metrics.githubRepoMilestonesIssuesTotalGauge.set(
          {
            owner,
            repository,
            title: milestone.title,
            number: milestone.number.toString(),
          },
          milestone.issues.totalCount,
        );
      });

      this.metrics.githubRepoScrapedGauge.set({ owner, repository }, 1);
    } catch (err) {
      this.metrics.githubRepoScrapedGauge.set({ owner, repository }, 0);

      logger.error(
        `Failed to scrape details from repository ${repository}: ${(err as Error).message}`,
        err,
      );
    }
  }
}

export default Summarize;
