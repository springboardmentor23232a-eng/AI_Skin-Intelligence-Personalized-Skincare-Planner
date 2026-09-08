# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Vite inlines VITE_* env vars at build time, so they must be passed as
# build args (see docker-compose.yml) rather than set at container runtime.
ARG VITE_API_URL=http://localhost:5000/api
ARG VITE_SERVER_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL

RUN npm run build

# ---- Serve stage ----
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
