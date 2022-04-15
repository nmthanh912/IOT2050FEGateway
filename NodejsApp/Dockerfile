FROM node:16.14.2

# Create app directory (physical path in host)
WORKDIR /usr/src/app/iot2050cfserver

COPY . .
RUN rm package-lock.json

RUN mkdir Database
RUN mkdir customJSON

RUN npm install

EXPOSE 4000

CMD [ "node", "index.js" ]