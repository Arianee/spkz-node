FROM node:alpine3.14

WORKDIR /home/api

COPY dist ./src
COPY migrate ./migrate
COPY package.json .
COPY .sequelizerc .

RUN npm i --only=prod


EXPOSE 80
ENTRYPOINT ["npm", "run", "start:prod"]
