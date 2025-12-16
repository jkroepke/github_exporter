import * as Prometheus from "prom-client";
import ghRestApi from "../github/rest.js";
import logger from "../logger.js";

class RateLimit {
  private metrics!: {
    githubRateLimitLimitGauge: Prometheus.Gauge<string>;
    githubRateLimitRemainingGauge: Prometheus.Gauge<string>;
    githubRateLimitResetGauge: Prometheus.Gauge<string>;
  };

  constructor() {
    this.registerMetrics();
  }

  registerMetrics(): void {
    this.metrics = {
      githubRateLimitLimitGauge: new Prometheus.Gauge({
        name: "github_rate_limit_limit",
        help: "GitHub API rate limit limit",
        labelNames: ["api"],
      }),
      githubRateLimitRemainingGauge: new Prometheus.Gauge({
        name: "github_rate_limit_remaining",
        help: "GitHub API rate limit remaining",
        labelNames: ["api"],
      }),
      githubRateLimitResetGauge: new Prometheus.Gauge({
        name: "github_rate_limit_reset",
        help: "GitHub API rate limit reset",
        labelNames: ["api"],
      }),
    };
  }

  async scrapeGlobal(): Promise<void> {
    try {
      const response = await ghRestApi.rateLimit.get();

      (["core", "search", "graphql", "integration_manifest"] as const).forEach((api) => {
        this.metrics.githubRateLimitLimitGauge.set(
          { api },
          response.data.resources?.[api]?.limit || 0,
        );

        this.metrics.githubRateLimitRemainingGauge.set(
          { api },
          response.data.resources?.[api]?.remaining || 0,
        );

        this.metrics.githubRateLimitResetGauge.set(
          { api },
          response.data.resources?.[api]?.reset || 0,
        );
      });
    } catch (err) {
      logger.error(`Failed to scrape rate-limits via REST: ${(err as Error).message}`, err);
    }
  }
}

export default RateLimit;
