# Production Dockerfile for Atlas Full Backend + ML Runtime
FROM node:20-bullseye-slim

# Install Python 3 and pip
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install ML Python Dependencies
COPY ml/requirements.txt ./ml/
RUN pip3 install --no-cache-dir -r ./ml/requirements.txt

# Install Node.js Backend Dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy Application Source Code & Pre-trained ML Models
COPY ml ./ml
COPY backend ./backend

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=8000
ENV PYTHON_PATH=python3

EXPOSE 8000

CMD ["node", "src/server.js"]
