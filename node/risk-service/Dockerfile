ARG PARENT_VERSION=2.2.2-node20.11.1

FROM defradigital/node-development:${PARENT_VERSION} AS node

USER root

RUN set -xe \
    && apk update && apk upgrade \
    && apk add bash make gcc g++ py-pip curl npm \
    && npm install --ignore-scripts -g npm \
    && rm -rf /var/cache/apk/* \
    && mkdir /home/node/app \
    && chown -R node:node /home/node/

WORKDIR /home/node/app

RUN mkdir -p ./node_modules

COPY --chown=root:root ./package*.json ./

COPY --chown=root:root ./index.js .

RUN npm ci --ignore-scripts

COPY --chown=root:root ./server ./server

EXPOSE 8050

USER node

CMD [ "node", "index.js" ]
