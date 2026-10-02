# ---------- Etapa 1: compilar el frontend ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# La URL de la API se fija al compilar (Vite la incrusta en el bundle)
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---------- Etapa 2: servir con nginx ----------
FROM nginx:alpine
ENV PORT=10000
ENV NGINX_ENVSUBST_FILTER=^PORT$
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 10000
CMD ["nginx", "-g", "daemon off;"]
