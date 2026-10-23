# syntax=docker/dockerfile:1

# ---------- build ----------
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
# O token do GitHub Packages chega como secret do BuildKit e nunca vira camada da imagem.
RUN --mount=type=secret,id=node_auth_token,env=NODE_AUTH_TOKEN,required=false \
    export NODE_AUTH_TOKEN="${NODE_AUTH_TOKEN:-}" && npm ci --no-audit --no-fund
COPY . .
# Variáveis públicas do Vite (entram no JavaScript do navegador): só o que é seguro expor.
ARG VITE_CONTACT_EMAIL=""
ENV VITE_CONTACT_EMAIL=${VITE_CONTACT_EMAIL}
RUN export NODE_AUTH_TOKEN="" && npm run build

# ---------- runtime ----------
FROM nginxinc/nginx-unprivileged:1.31-alpine AS runtime
ENV MIXTAPE_API_UPSTREAM=http://api:3000 \
    MIXTAPE_PUBLIC_URL=http://localhost:5180
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY nginx/client-ip.conf /etc/nginx/snippets/client-ip.conf
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
# Numa subpasta: o envsubst gera /etc/nginx/conf.d/mixtape/site.conf, que o nginx.conf não inclui sozinho (só os
# *.conf da raiz do conf.d); os dois `server` o incluem.
COPY nginx/site.conf.template /etc/nginx/templates/mixtape/site.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
# 8080: a porta publicada. 8081: a do túnel da Cloudflare, só na rede do compose (nunca publicar).
EXPOSE 8080 8081
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz > /dev/null || exit 1
