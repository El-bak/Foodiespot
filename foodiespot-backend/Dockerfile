# ===========================================
# Stage 1 : installation des dépendances de production uniquement
# ===========================================
FROM node:22-alpine AS deps

WORKDIR /app

# On ne copie que les fichiers de dépendances pour profiter du cache Docker
# (tant que package*.json ne change pas, ce layer n'est pas reconstruit)
COPY package.json package-lock.json ./
RUN npm install --omit=dev --no-audit --no-fund

# ===========================================
# Stage 2 : image finale, légère, sans devDependencies ni node_modules de build
# ===========================================
FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

# Utilisateur non-root pour la sécurité (bonne pratique conteneurs)
RUN addgroup -S foodiespot && adduser -S foodiespot -G foodiespot

# Récupère uniquement les node_modules déjà installés (pas besoin de refaire npm ci)
COPY --from=deps /app/node_modules ./node_modules

# Copie du code applicatif (voir .dockerignore pour les exclusions)
COPY --chown=foodiespot:foodiespot . .

# Dossiers créés par l'app au démarrage si absents, on s'assure des bons droits
RUN mkdir -p /app/data /app/uploads && chown -R foodiespot:foodiespot /app/data /app/uploads

USER foodiespot

EXPOSE 4000

# Healthcheck basé sur le endpoint /health de l'API (utilisé aussi par docker-compose)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

CMD ["node", "server.js"]
