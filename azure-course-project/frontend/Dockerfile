# Module 05 · Containerized Solutions — Frontend Dockerfile
# Multi-stage: build with Node, serve with nginx
# Build:  docker build -t azure-course-frontend .
# Run:    docker run -p 80:80 azure-course-frontend

# ── Stage 1: Build ─────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Pass VITE_ env vars at build time
ARG VITE_AZURE_CLIENT_ID
ARG VITE_AZURE_TENANT_ID
ARG VITE_API_BASE_URL

RUN npm run build

# ── Stage 2: Serve with nginx ──────────────────────────────────
FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html

# React Router — send all routes to index.html
RUN printf 'server {\n  listen 80;\n  location / {\n    root /usr/share/nginx/html;\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
