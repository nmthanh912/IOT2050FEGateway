FROM node:16.14.2

# Create app directory (physical path in container)
WORKDIR /usr/src/app/iot2050app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# COPY package*.json ./

# RUN npm install
RUN npm install -g serve
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY ./build .

EXPOSE 3000

CMD serve -s . -l 3000