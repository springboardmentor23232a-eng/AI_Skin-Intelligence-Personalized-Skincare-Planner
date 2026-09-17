FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend source code
COPY . .

EXPOSE 5000

ENV PORT=5000

CMD ["node", "server.js"]
