FROM node:16.13.1 AS builder
WORKDIR /usr/src/app/modbustcp
COPY . .
RUN npm ci --omit=dev
RUN npm i -g @vercel/ncc
RUN ncc build index.js -o dist
RUN mkdir dist/Database && mkdir dist/customJSON && mkdir dist/deviceStates && touch dist/deviceStates/modbusTCP.txt
COPY .env dist

FROM node:16.13.1-slim
WORKDIR /usr/src/app/modbustcp
COPY --from=builder /usr/src/app/modbustcp/dist/ .
EXPOSE 4002
CMD ["node", "index.js"]