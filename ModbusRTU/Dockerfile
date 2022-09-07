FROM node:16.13.1 AS builder
WORKDIR /usr/src/app/modbusrtu
COPY . .
RUN npm ci --omit=dev
RUN npm i --location=global @vercel/ncc
RUN ncc build index.js -o dist
RUN mkdir dist/Database && mkdir dist/customJSON && mkdir dist/deviceStates && touch dist/deviceStates/modbusRTU.txt
COPY .env dist

FROM node:16.13.1-slim
WORKDIR /usr/src/app/modbusrtu
COPY --from=builder /usr/src/app/modbusrtu/dist/ .
EXPOSE 4002
CMD ["node", "index.js"]