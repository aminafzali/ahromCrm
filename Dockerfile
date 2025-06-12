# Build Stage
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy whole project and build
COPY . .
RUN npm run build

# Production Stage
FROM node:20-alpine

# Install tzdata for timezone support
RUN apk add --no-cache tzdata

WORKDIR /app

# Set timezone
ENV TZ=Asia/Tehran

COPY --from=builder /app ./

EXPOSE 4010

ENV PORT=4010
ENV NODE_ENV=production

CMD ["npm", "run", "start"]
