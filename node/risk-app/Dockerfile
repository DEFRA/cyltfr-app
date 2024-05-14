FROM node:20-alpine

RUN set -xe \
    && apk update && apk upgrade \
    && apk add bash make gcc g++ py-pip curl npm \
    && npm install --ignore-scripts -g npm \
    && npm install --ignore-scripts -g nodemon \
    && rm -rf /var/cache/apk/* \
    && mkdir /home/node/app \
    && chown -R node:node /home/node/

WORKDIR /home/node/app

RUN mkdir -p ./node_modules

COPY --chown=root:root ./package*.json ./

COPY --chown=root:root ./bin ./bin

COPY --chown=root:root ./index.js .

COPY --chown=root:root ./client ./client

COPY --chown=root:root ./.husky ./.husky

COPY --chown=root:root ./webpack.config.js .

RUN npm ci --ignore-scripts

COPY --chown=root:root ./server ./server

RUN npm run build

EXPOSE 3000

USER node

CMD [ "npm", "run", "dev" ]
