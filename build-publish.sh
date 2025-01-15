#!/bin/bash

DOCKER_BUILDKIT=1 docker build  --platform=linux/amd64 -t eugeniumegherea/immich-control-plane -f apps/immich-control-plane/Dockerfile .   

docker push eugeniumegherea/immich-control-plane