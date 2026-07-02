#!/bin/sh
set -e

mkdir -p /app/data

DATA_DIR=/app/data PORT=8090 node /app/backend/server.js &

nginx -g 'daemon off;'
