# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json* ./
COPY package-lock.json* ./

# Install dependencies
RUN npm install --production

# Copy all source files
COPY . .

# Build Next.js app
RUN npm run build

# Expose port (default Next.js port)
EXPOSE 3000

# Start Next.js app
CMD ["npm", "start"]
