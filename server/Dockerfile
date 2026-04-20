FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy dependency files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your code
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Start the app using the script we fixed in package.json
CMD ["npm", "start"]