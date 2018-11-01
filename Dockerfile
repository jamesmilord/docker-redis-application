FROM node:8-alpine

WORKDIR /code

COPY package.json /code/package.json
RUN yarn 

COPY . /code
