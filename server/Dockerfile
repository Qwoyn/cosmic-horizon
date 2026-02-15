FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY tsconfig.json ./
COPY src/ ./src/
COPY knexfile.ts ./

# Build TypeScript
RUN npx tsc

EXPOSE 3000

CMD ["node", "dist/index.js"]
