# FROM node:17-buster
FROM node:16-slim

# Create app directory (physical path in host)
WORKDIR /usr/src/app/opc_ua

COPY package*.json ./

RUN mkdir Database
RUN mkdir customJSON

RUN npm ci

COPY . .

EXPOSE 4004

CMD [ "node", "index.js" ]