FROM node:22
WORKDIR /user_service
COPY package*.json ./  
RUN npm install 
COPY . . 
EXPOSE 3001
CMD [ "node" , "index.js" ]

# because we did not wanted node modules, package lock json  to be a part of this we deleted it before creating this image 