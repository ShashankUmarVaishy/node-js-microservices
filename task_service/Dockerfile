FROM node:22
WORKDIR /task_service
COPY package*.json ./  
RUN npm install 
COPY . . 
EXPOSE 3002
CMD [ "node" , "index.js" ]

# because we did not wanted node modules, package lock json  to be a part of this we deleted it before creating this image 