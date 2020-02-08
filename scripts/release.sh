#!/usr/bin/env bash

# From: https://github.com/semantic-release/semantic-release/blob/master/docs/recipes/github-actions.md

curl -v -H "Accept: application/vnd.github.everest-preview+json" \
  -H "Authorization: token ${GITHUB_TOKEN}" https://api.github.com/repos/jkroepke/github_exporter/dispatches \
  -d '{ "event_type": "semantic-release" }'
