FROM node:25-alpine AS spa-builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN VITE_API_URL=/api npm run build

FROM node:25-alpine AS og-builder

WORKDIR /app

COPY og-server/package*.json ./
RUN npm ci

COPY og-server/ .
RUN npm run build
RUN npm prune --omit=dev

FROM nginx:alpine

RUN apk add --no-cache nodejs

RUN rm -rf /usr/share/nginx/html/*

COPY --from=spa-builder /app/dist /usr/share/nginx/html

COPY --from=og-builder /app/dist         /opt/og-server/dist
COPY --from=og-builder /app/node_modules /opt/og-server/node_modules

COPY nginx.conf.template /etc/nginx/templates/default.conf.template

COPY entrypoint.sh /docker-entrypoint.d/40-og-server.sh
RUN sed -i 's/\r$//' /docker-entrypoint.d/40-og-server.sh && chmod +x /docker-entrypoint.d/40-og-server.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
