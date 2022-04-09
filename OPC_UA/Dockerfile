FROM node:16-alpine

# Create app directory (physical path in host)
WORKDIR /usr/src/app/opc_ua

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN mkdir Database

RUN npm install

RUN npm uninstall sqlite3
RUN npm i sqlite3
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 4004

CMD [ "node", "index.js" ]