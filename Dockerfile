FROM oven/bun:alpine

WORKDIR /app

COPY ./ ./

RUN bun --version

CMD ["bun", "run", "src/index.ts"]