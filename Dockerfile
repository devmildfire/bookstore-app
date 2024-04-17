# # Use the super official Node.js image as the base  
# FROM node:20-alpine

# # Set the working directory inside the container  
# WORKDIR /app    

# # Copy package.json and package-lock.json to the container  
# COPY package*.json ./

# # RUN npm ci  
# RUN npm install  

# # Copy the app source code to the container  
# COPY . .  

# # Build the Next.js app  
# RUN npm run build  

# # Expose the port the app will run on  
# EXPOSE 3000

# # Start the app  
# CMD ["npm", "start"]  

FROM node:20-alpine as builder
WORKDIR /my-space

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine as runner
WORKDIR /my-space
COPY --from=builder /my-space/package.json .
COPY --from=builder /my-space/package-lock.json .
COPY --from=builder /my-space/next.config.js ./
COPY --from=builder /my-space/public ./public
COPY --from=builder /my-space/.next/standalone ./
COPY --from=builder /my-space/.next/static ./.next/static
EXPOSE 3000
ENTRYPOINT ["npm", "start"]
