# --- Stage 1: Build the Client ---
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# --- Stage 2: Build the Server ---
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npm run build

# --- Stage 3: Production Image ---
FROM node:20-alpine
WORKDIR /app

# Copy built server files
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/package*.json ./server/
WORKDIR /app/server
RUN npm install --omit=dev

# Copy built client files (server serves these)
COPY --from=client-builder /app/client/dist /app/client/dist

# Expose the server port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["node", "dist/index.js"]
