#!/usr/bin/env bash

MKTEMP=$(mktemp)

METRICS="$(curl -s localhost:9171 | grep -E -A1 '(HELP|TYPE)' | grep github)"

{
  sed '/## Metrics/q' README.md;
  echo;
  echo '```';
  echo "${METRICS}"
  echo '```';
  echo '';
  sed -ne '/## Contributing/,$ p' README.md;
} > "${MKTEMP}"

mv "${MKTEMP}" README.md
