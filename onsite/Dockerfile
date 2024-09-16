ARG ENV_NAME=regtest

# Step 2: Serve static files
FROM nginxinc/nginx-unprivileged

# Copy built static files to Nginx's html directory
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built static files to Nginx's html directory
COPY .output/public /usr/share/nginx/html/aN3nNFwFoi5QkyPaVJ54dDTDc6HrrCYGAL6U6GUuyV2uvvekgOxqYe6K2hur/onsite

# Expose port 8000
EXPOSE 8000

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
