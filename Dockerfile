# Node.js 18
FROM node:18

# Create app directory(workpace folder)
WORKDIR /app

# copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code không nằm trong .dockerignore
COPY . .

# Expose port 3001 (Mở cổng 3001 cho ứng dụng)
EXPOSE 3001

# Run app
CMD ["node", "src/server.js"]