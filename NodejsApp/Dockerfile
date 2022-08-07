FROM node:16 AS builder
WORKDIR /usr/src/app/iot2050cfserver
COPY . .
RUN npm ci --omit=dev
RUN npm i --location=global @vercel/ncc
RUN ncc build index.js -o dist
COPY .env dist

FROM node:16-slim
WORKDIR /usr/src/app/iot2050cfserver
COPY --from=builder /usr/src/app/iot2050cfserver/dist/ .
RUN mkdir Database
RUN mkdir customJSON
EXPOSE 4002
CMD ["node", "index.js"]