FROM node:17-buster

# Create app directory (physical path in host)
WORKDIR /usr/src/app/opc_ua

COPY package*.json ./
RUN rm package-lock.json

RUN mkdir Database
RUN mkdir customJSON

RUN npm install
RUN npm uninstall sqlite3
RUN npm install sqlite3@4.2.0

COPY . .

EXPOSE 4004

CMD [ "node", "index.js" ]