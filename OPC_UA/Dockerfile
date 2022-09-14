FROM node:16.13.1 AS builder
WORKDIR /usr/src/app/opc_ua
COPY . .
RUN npm ci --omit=dev
RUN npm i -g @vercel/ncc
RUN ncc build index.js -o dist
RUN mkdir dist/Database && mkdir dist/customJSON && mkdir dist/deviceStates && touch dist/deviceStates/opc_ua.txt
COPY .env dist

FROM node:16.13.1-slim
WORKDIR /usr/src/app/opc_ua
COPY --from=builder /usr/src/app/opc_ua/dist/ .
EXPOSE 4002
CMD ["node", "index.js"]