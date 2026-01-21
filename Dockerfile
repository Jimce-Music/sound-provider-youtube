FROM oven/bun:alpine

WORKDIR /app

COPY . .

RUN apk add --no-cache yt-dlp ffmpeg wget

CMD ["bun", "run", "src/index.ts"]