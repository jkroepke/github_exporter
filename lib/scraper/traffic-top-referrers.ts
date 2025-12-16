import * as Prometheus from "prom-client";
import ghRestApi from "../github/rest.js";
import logger from "../logger.js";

interface ReferrerMetric {
  referrer: string;
  count: number;
  uniques: number;
}

class TrafficTopReferrers {
  private metrics!: {
    githubRepoReferrerViewsGauge: Prometheus.Gauge<string>;
    githubRepoReferrerViewsUniqueGauge: Prometheus.Gauge<string>;
  };

  constructor() {
    this.registerMetrics();
  }

  registerMetrics(): void {
    this.metrics = {
      githubRepoReferrerViewsGauge: new Prometheus.Gauge({
        name: "github_repo_traffic_referring_sites_views",
        help: "Total views from top 10 referrer for given repository",
        labelNames: ["owner", "repository", "referrer"],
      }),
      githubRepoReferrerViewsUniqueGauge: new Prometheus.Gauge({
        name: "github_repo_traffic_referring_sites_unique_vistors",
        help: "Total unique visitors from top 10 referrers for given repository",
        labelNames: ["owner", "repository", "referrer"],
      }),
    };
  }

  async scrapeRepository(repository: string): Promise<void> {
    try {
      const [owner, repo] = repository.split("/");
      const response = await ghRestApi.repos.getTopReferrers({ owner, repo });

      response.data.forEach((referrer: ReferrerMetric) => {
        this.metrics.githubRepoReferrerViewsGauge.set(
          { owner, repository, referrer: referrer.referrer },
          referrer.count,
        );
        this.metrics.githubRepoReferrerViewsUniqueGauge.set(
          { owner, repository, referrer: referrer.referrer },
          referrer.uniques,
        );
      });
    } catch (err) {
      logger.error(
        `Failed to scrape referrer metrics for repository ${repository} via REST: ${(err as Error).message}`,
        err,
      );
    }
  }

  scrapeRepositories(repositories: string[]): void {
    this.metrics.githubRepoReferrerViewsGauge.reset();
    this.metrics.githubRepoReferrerViewsUniqueGauge.reset();
    repositories.forEach((repository) => {
      void this.scrapeRepository(repository);
    });
  }
}

export default TrafficTopReferrers;
