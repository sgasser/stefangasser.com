FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Remove dev dependencies for smaller image
RUN npm prune --omit=dev

FROM node:20-alpine AS runtime

WORKDIR /app

# Copy built application and production dependencies only
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

# Astro Node adapter runs on port 4321 by default
ENV HOST=0.0.0.0
ENV PORT=4321

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
