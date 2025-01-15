# Immich Import Control

Run at most one job at a time on a device with limited resources. Start automatically if there's new media to process and run through the processing pipeline until all media is processed.

## Problem
I am running immich on Beelink s12 pro (intel n100 cpu and 16GB of ram). If it runs all jobs at the same time, cpu spikes and docker will restart immich containers because health check will start failing. This becomes very unusable very quickly.

To solve this, I've written a simple orchestrator that will pause and resume jobs until all media is processed. For best results, concurrency in immich should be set in such a way to maximize a single job processing speed and yet to not overwhelm the system.


## How it works

First of all, it will call immich API to pause all jobs when this app starts.

Every 30 seconds we will be calling `/api/jobs/` to get current job status.
It will understand based on `metadataExtraction` value if immich has new media to ingest. (it is always a nonzero value if there's new media to process)

If we have new media to process, it will start running through the pipeline in this order:
```
Library
Sidecar
Metadata Extraction
Smart Search
Duplicate Detection
Face Detection
Facial Recognition
Thumbnail Generation
Video Conversion
```

First it will resume library job, wait for 30 seconds and check if it has finished. If it has, it will resume sidecar job and so on. The application will check every 30 seconds for the job to finish and then resume the next job in the pipeline until all of the pipeline is finished. Then it will wait again for new media to become available.


## Getting Started

Add new container definition to docker-compose.yml file:
```yaml
services:
  immich-server:
    ...

  immich-import-control:
    image: ghcr.io/eugeniumegherea/immich-import-control:latest
    container_name: immich-import-control
    environment:
      SERVER_URL: http://immich-server:2283
      API_KEY: immich-api-key
    restart: always
    depends_on:
      - immich-server
```

And restart the docker-compose stack:
```bash
docker-compose up -d
```

## Running locally

Create a `.env` file with the following content:
```bash
API_KEY=immich_api_key
SERVER_URL=http://<local_ip_address>:2283
```

Then run the following command:
```bash
npx nx serve
```
