FROM node:16-alpine as builder
WORKDIR /usr/src/app/logger
COPY . .
RUN npm ci --omit=dev
RUN npm i --location=global @vercel/ncc
RUN ncc build index.js -o dist
COPY .env dist/

FROM node:16-alpine
WORKDIR /usr/src/app/logger
COPY --from=builder /usr/src/app/logger/dist/ .

CMD ["node", "index.js"]