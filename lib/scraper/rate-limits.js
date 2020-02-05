const metrics = require('../metrics');

const scrapeRateLimitGraphql = (response) => {
  if ('limit' in response.rateLimit) {
    metrics.githubRateLimitLimitGauge.set(
      { api: 'graphql' },
      Number(response.rateLimit.limit),
    );
  }
  if ('remaining' in response.rateLimit) {
    metrics.githubRateLimitRemainingGauge.set(
      { api: 'graphql' },
      Number(response.rateLimit.remaining),
    );
  }
  if ('resetAt' in response.rateLimit) {
    metrics.githubRateLimitResetGauge.set(
      { api: 'graphql' },
      Number(Date.parse(response.rateLimit.resetAt) / 1000),
    );
  }

  return response;
};

const scrapeRateLimitRest = (response) => {
  if ('x-ratelimit-limit' in response.headers) {
    metrics.githubRateLimitLimitGauge.set(
      { api: 'rest' },
      Number(response.headers['x-ratelimit-limit']),
    );
  }
  if ('x-ratelimit-remaining' in response.headers) {
    metrics.githubRateLimitRemainingGauge.set(
      { api: 'rest' },
      Number(response.headers['x-ratelimit-remaining']),
    );
  }
  if ('x-ratelimit-reset' in response.headers) {
    metrics.githubRateLimitResetGauge.set(
      { api: 'rest' },
      Number(response.headers['x-ratelimit-reset']),
    );
  }

  return response;
};

module.exports = {
  scrapeRateLimitGraphql,
  scrapeRateLimitRest,
};
