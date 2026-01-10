FROM node:20-alpine AS builder

WORKDIR /server

COPY package*.json ./

RUN npm i --legacy-peer-deps

# Copy the rest of the application code
COPY . .

RUN npm run build

# build release image
FROM node:20-alpine

COPY --from=builder server/dist ./dist
COPY --from=builder server/package-lock.json ./
COPY --from=builder server/package.json ./
COPY --from=builder server/build/scripts ./

RUN npm i --production

EXPOSE 3000

CMD ["npm", "run", "start"]
