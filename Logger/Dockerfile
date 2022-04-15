FROM node:16.14.2

WORKDIR /usr/src/app/logger

COPY package*.json ./

RUN mkdir LogFolder

RUN npm i
COPY . .
CMD node index.js