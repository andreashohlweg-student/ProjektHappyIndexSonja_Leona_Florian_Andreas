FROM node:24-bookworm-slim
WORKDIR /server
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "run", "dev"]
