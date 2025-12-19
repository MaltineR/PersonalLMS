# Use Node.js 18 lightweight image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start the backend
CMD ["npm", "start"]
