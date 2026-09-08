FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source
COPY . .

# Uploaded skin images are written here at runtime — mount a volume onto
# this path in docker-compose so they survive container restarts.
RUN mkdir -p uploads

ENV NODE_ENV=production
EXPOSE 5000

RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
