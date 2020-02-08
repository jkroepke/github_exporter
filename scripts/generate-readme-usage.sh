#!/usr/bin/env bash

MKTEMP=$(mktemp)

HELP="$(node index.js --help)"

{
  sed '/## Usage/q' README.md;
  echo;
  echo '```';
  echo "${HELP}"
  echo '```';
  echo '';
  sed -ne '/### .env file config/,$ p' README.md;
} > "${MKTEMP}"

mv "${MKTEMP}" README.md
