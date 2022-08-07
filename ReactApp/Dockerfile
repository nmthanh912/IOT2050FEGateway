FROM node:16-alpine

# Create app directory (physical path in container)
WORKDIR /usr/src/app/iot2050app

RUN npm i --location=global serve
COPY ./build .

EXPOSE 3000

CMD serve -s . -l 3000