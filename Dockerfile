FROM oven/bun:alpine

WORKDIR /app

COPY . .

RUN apk add --no-cache ffmpeg wget
RUN apk add --no-cache python3 py3-pip
RUN pip3 install yt-dlp --break-system-package

CMD ["bun", "run", "src/index.ts"]