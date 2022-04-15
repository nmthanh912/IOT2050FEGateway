FROM node:17-buster

# Create app directory (physical path in host)
WORKDIR /usr/src/app/opc_ua

COPY . .
RUN rm package-lock.json

RUN mkdir Database
RUN mkdir customJSON

RUN npm install

EXPOSE 4004

CMD [ "node", "index.js" ]