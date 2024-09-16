ARG ENV_NAME=regtest

# Step 1: Build the application
FROM node:22-alpine AS build
ARG ENV_NAME

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json
COPY onsite/package*.json onsite/yarn.lock ./

# Install npm dependencies
RUN npm install yarn
RUN yarn install

# Copy the rest of the application
COPY onsite/public ./public
COPY onsite/server ./server
COPY onsite/nuxt.config.ts onsite/tailwind.config.js onsite/tsconfig.json ./
COPY onsite/app ./app
COPY ./environment.${ENV_NAME}.ts ./app/config/environment.ts

# Build Nuxt 3 application
RUN npm run generate

# Step 2: Serve static files
FROM nginxinc/nginx-unprivileged

# Copy built static files to Nginx's html directory
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built static files to Nginx's html directory
COPY --from=build /app/.output/public /usr/share/nginx/html/aN3nNFwFoi5QkyPaVJ54dDTDc6HrrCYGAL6U6GUuyV2uvvekgOxqYe6K2hur/onsite

# Expose port 8000
EXPOSE 8000

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
