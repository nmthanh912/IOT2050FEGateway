# FROM node:17-buster
FROM node:16-slim

# Create app directory (physical path in host)
WORKDIR /usr/src/app/iot2050cfserver

COPY package*.json ./

RUN mkdir Database
RUN mkdir customJSON

RUN npm ci

COPY . .

EXPOSE 4000

CMD [ "node", "index.js" ]