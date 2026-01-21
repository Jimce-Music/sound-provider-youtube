FROM oven/bun:alpine

WORKDIR /app

COPY . .

RUN apk add --no-cache yt-dlp ffmpeg

CMD ["bun", "run", "src/index.ts"]