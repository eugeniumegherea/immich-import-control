#!/bin/bash

# stop execution if a step fails
set -e

npm version minor
npx nx build

VERSION=$(node -p "require('./package.json').version")

DOCKER_BUILDKIT=1 docker build  --platform=linux/amd64 -t eugeniumegherea/immich-import-control:${VERSION} .

docker push eugeniumegherea/immich-import-control:${VERSION}
