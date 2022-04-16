FROM node:17-buster

# Create app directory (physical path in host)
WORKDIR /usr/src/app/iot2050cfserver

COPY . .
RUN rm package-lock.json

RUN mkdir Database
RUN mkdir customJSON

RUN npm install sqlite3@4.2.0
RUN npm install

EXPOSE 4000

CMD [ "node", "index.js" ]