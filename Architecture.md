# Requirements for jimce-music/sound-provider-youtube

- [Requirements for jimce-music/sound-provider-youtube](#requirements-for-jimce-musicsound-provider-youtube)
  - [Introduction](#introduction)
  - [Basic information](#basic-information)
  - [Development](#development)
    - [Getting started](#getting-started)
    - [Development guidelines](#development-guidelines)
    - [Requirements](#requirements)
      - [API endpoints](#api-endpoints)
        - [GET /info](#get-info)
        - [GET /request-play](#get-request-play)
        - [GET /stream?id=\[uuid\]](#get-streamiduuid)
        - [GET /download?id=\[uuid\]](#get-downloadiduuid)
      - [Docker image](#docker-image)
      - [Automated tests](#automated-tests)
      - [Clear documentation](#clear-documentation)

## Introduction

This document specifies an initial draft for a jimce sound provider. A sound provider is a separate docker container which can be used by the Jimce server to download and or stream songs. The endpoints are nearly identical for all sound providers and thus allow the main server to dynamically decide which sound provider to use and quickly revert to fallback containers. Sound providers are isolated from the main server by design, because some users might prefer downloading songs from youtube or other archives, while others might prefer a song request system, that allows to manage requested songs and buy their mp3s on demand.
This document especially focuses on the youtube sound provider, as it is the easiest to implement.

## Basic information

**Repository:** [jimce-music/sound-provider-youtube](httpss://github.com/jimce-music/sound-provider-youtube)

**Initial developer:** [@MarcusNebel](https://github.com/MarcusNebel)

**Draft & architecture designer:** [@CabraViva](https://github.com/cabraviva)

**Software & runtime:** Bun + Typescript + Fastify + Docker

**LICENSE:** MIT

## Development

This section shortly explains how the initial developer should approach the development process and specifies the requirements which must be fulfilled before the container may be used in production.

### Getting started

In order to get started quickly, decide on a programming language and runtime. Even though anything is feasible here, as it will run in docker, I recommend Typescript + Bun, as it is also used for the main Jimce server.

1. Start by creating a `src/` folder and add a `index.ts`
2. Create a Dockerfile extending `oven/bun:distroless` (for minimal overhead), and copy the src dir, then specify the run command
3. For testing, just use the local bun runtime
4. Add a dev script in the `package.json` to run the sound provider with the local bun runtime
5. Create a github action / workflow that automatically publishes the docker image to the GHCR on a new commit on the main branch

### Development guidelines

Please follow these development guidelines:

1. Always work on the `dev` branch, never on `main` unless you want to merge a stable, tested pull request, as this will trigger a new release
2. Many commits with descriptive titles are preferred over few which contain many features at once
3. Try to use no workarounds or typescript `any` types, to maintain stable code
4. When implementing testing later, look at the code coverage
5. Using AI is allowed, at least for implementing the github actions workflows or getting the docker image to run. But try to keep the code your own

### Requirements

#### API endpoints

This specifies all API endpoints which the server should offer.

##### GET /info

This route will be used in the health check and will be periodically called by the jimce main server to decide which sound provider to use.
It requires no parameters and should, at least for the youtube sound provider return this json with a 200 status code:

```json
{
  "name": "jimce-music/sound-provider-youtube",
  "license": "MIT",

  "provider-type": "youtube",
  "expected-sound-quality": "medium",

  "best-for": {
    "streaming": true,
    "downloads": false
  },

  "capabilities": {
    "streaming": [true, "/stream"],
    "downloads": [true, "/download"]
  },

  "accepted-identifiers": ["youtube:id", "youtube:url"]
}
```

##### GET /request-play

This endpoint is called by the main server before streaming or downloading anything. Its basically the server asking the sound provider (here: SP): Hey, can you prepare a stream / download for me? I need an id.

The server then expects the SP to respond with a uuid (v4), initiate the ytdl stream and depending on provided parameters maybe even downloading at the same time.

Also make sure, that if a stream for the song already exists, just return the already assigned uuid => save active streams in RAM

**Required parameters:**
|Parameter name|Type|Description|
|--|--|--|
|identifier|string|The youtube url or video id (check in code) of the video which must be downloaded|
|just-download|boolean|Whether the server wants to stream the song or just download it|
|save-while-streaming|boolean|Indicates whether the SP should also save all loaded / streamed songs into RAM and combine it into a mp3 later. This avoids two streams in parallel, as the downloaded-callback is used later|
|downloaded-callback|string (optional, parameter must not be provided)|The full url which may be GET-requested by the sound-provider once the download is done. Must not be provided.|

**Example request:** _GET_ /request-play?identifier=dQw4w9WgXcQ&just-download=false&save-while-streaming=true&downloaded-callback=http://jimce-server:8080/api/downlaoded-callback/67as0fhufuiashiu

**Returns: If everything is working - 200 OK - json**

```json
{
  "success": true,
  "id": "[uuid]",
  "content-length": 197400, // in bytes
  "length-seconds": 203 // 203 seconds long song
}
```

**Returns: On error - 500 Internal server error - json**

```json
{
  "success": false,
  "err-msg": "[error message here]"
}
```

##### GET /stream?id=\[uuid\]

This endpoint is called when the server previously requested a _play_ and now tries to stream a specific chunk of the song / video. This happens byte / size based, not time based.
There are parameters sent by the client, but this happens as a header.
The response should be binary.

For additional information, ask AI how to implement HTTP range requests with ytdl-core in bun + fastify, or see <https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests>.

Make sure to, if requested by the server, also save already streamed chunks into an mp3, to download later, and call the downloaded-callback.

##### GET /download?id=\[uuid\]

This route is only called when the SP already called the downloaded callback, ergo the full file is already prepared by the SP.
It should just return the mp3 or sound file, so it can be saved by the server.

#### Docker image

As already described above, implement a self publishing docker image and provide an example compose file. The docker image should publish to the GHCR on a commit on the `main` branch (maybe protect it later via GH rules) and must be based on `oven/bun:distroless`. Possibly add a health check in the compose file which tests if the container is running fine (by fetching the /info route).

#### Automated tests

To ensure the code is always stable and working, automated tests via github actions on every commit, branch and pull request are essential. Take a look at the main server repo to get inspired on how to implement those.

But to get started quickly, implement the following:

1. **Automated typescript check:** Create a github workflow which does a typescript check on every commit, on every branch and PR
2. **Integration tests:** Use `bun test` (take a look at the [documentation](https://bun.sh/docs/test)) to create a integration test which uses `fastify.inject` (ask AI for help here) to automatically test every route, streaming and downloading, but also the metadata routes via a github action. You can also get [code coverage](https://bun.sh/docs/test/code-coverage) to see how well your code is tested.
3. **Dependabot:** Enable Dependabot to auto-bump dependencies
4. **Enable GitHub code scanning:** To avoid security risks
5. **Add a schedule to the integration tests:** This instantly informs the developers once the SP stops working (because YouTube API changed or something else)

#### Clear documentation

At the end, make sure to create a detailed README file which documents all API routes, how to use them, what they return, which parameters they require, how to run the server in docker, how to get started developing, which tools are required for developing, maybe a link to the main Jimce repo and a contact link.
