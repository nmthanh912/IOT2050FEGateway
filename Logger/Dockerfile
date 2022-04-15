FROM node:16.14.2

WORKDIR /usr/src/app/logger

COPY . .
RUN rm package-lock.json

RUN mkdir LogFolder
RUN npm install

CMD node index.js