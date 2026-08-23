# Root Dockerfile for PanaceaAI Web Application & Express Server
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code and frontend static assets
COPY . .

# Expose Web Application Port
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "server/index.js"]
