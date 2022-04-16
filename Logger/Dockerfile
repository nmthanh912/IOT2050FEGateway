FROM node:17-buster
WORKDIR /usr/src/app/logger

COPY . .
RUN rm package-lock.json
RUN mkdir LogFolder
RUN npm install

CMD node index.js