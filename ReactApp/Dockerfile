FROM node:17-buster

# Create app directory (physical path in container)
WORKDIR /usr/src/app/iot2050app

RUN npm install -g serve
COPY ./build .

EXPOSE 3000

CMD serve -s . -l 3000