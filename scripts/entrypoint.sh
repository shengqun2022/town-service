#!/bin/sh
set -eu

node scripts/check-env.js
node dist/index.js
