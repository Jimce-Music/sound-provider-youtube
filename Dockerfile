FROM oven/bun:alpine

WORKDIR /app

COPY ./ ./

RUN apk add yt-dlp ffmpeg

RUN bun --version

CMD ["bun", "run", "src/index.ts"]