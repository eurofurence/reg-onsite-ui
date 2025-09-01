ARG ENV_NAME=reglive

# Step 1: Build the application
FROM node:24-alpine AS build
ARG ENV_NAME

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of the application
COPY *.html *.json *.ts ./
COPY src ./src
COPY ./src/config/environment.${ENV_NAME}.ts ./src/config/environment.ts

# Build application
RUN npm run build

# Step 2: Serve static files
FROM nginxinc/nginx-unprivileged

COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8000

# Copy built static files to Nginx's html directory
COPY --from=build /app/dist /usr/share/nginx/html/aN3nNFwFoi5QkyPaVJ54dDTDc6HrrCYGAL6U6GUuyV2uvvekgOxqYe6K2hur/onsite
