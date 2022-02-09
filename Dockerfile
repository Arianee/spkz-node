FROM node:14-alpine3.15

WORKDIR /home/api

COPY package.json .
COPY package-lock.json .
COPY .sequelizerc .
COPY ./src ./src

COPY tsconfig.json .
COPY tsconfig.migrate.json .

RUN npm ci
RUN npm run build

ENTRYPOINT ["npm", "run", "start:prod"]
