import * as Prometheus from "prom-client";
import ghRestApi from "../github/rest.js";
import logger from "../logger.js";

interface PathMetric {
  path: string;
  count: number;
  uniques: number;
}

class TrafficTopPaths {
  private metrics!: {
    githubRepoPopularContentViewsGauge: Prometheus.Gauge<string>;
    githubRepoPopularContentViewsUniqueGauge: Prometheus.Gauge<string>;
  };

  constructor() {
    this.registerMetrics();
  }

  registerMetrics(): void {
    this.metrics = {
      githubRepoPopularContentViewsGauge: new Prometheus.Gauge({
        name: "github_repo_traffic_popular_content_views",
        help: "Total views from top 10 content for given repository",
        labelNames: ["owner", "repository", "path"],
      }),
      githubRepoPopularContentViewsUniqueGauge: new Prometheus.Gauge({
        name: "github_repo_traffic_popular_content_unique_vistors",
        help: "Total unique views from top 10 content for given repository",
        labelNames: ["owner", "repository", "path"],
      }),
    };
  }

  async scrapeRepository(repository: string): Promise<void> {
    try {
      const [owner, repo] = repository.split("/");
      const response = await ghRestApi.repos.getTopPaths({ owner, repo });

      response.data.forEach((path: PathMetric) => {
        this.metrics.githubRepoPopularContentViewsGauge.set(
          { owner, repository, path: path.path },
          path.count,
        );
        this.metrics.githubRepoPopularContentViewsUniqueGauge.set(
          { owner, repository, path: path.path },
          path.uniques,
        );
      });
    } catch (err) {
      logger.error(
        `Failed to scrape path metrics for repository ${repository} via REST: ${(err as Error).message}`,
        err,
      );
    }
  }

  scrapeRepositories(repositories: string[]): void {
    this.metrics.githubRepoPopularContentViewsGauge.reset();
    this.metrics.githubRepoPopularContentViewsUniqueGauge.reset();
    repositories.forEach((repository) => {
      void this.scrapeRepository(repository);
    });
  }
}

export default TrafficTopPaths;
