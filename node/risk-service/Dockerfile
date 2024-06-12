ARG PARENT_VERSION=2.2.2-node20.11.1

FROM defradigital/node:${PARENT_VERSION} AS base
ARG PORT=8050
ENV PORT ${PORT}

USER root

RUN set -xe \
    && apk update && apk upgrade \
    && apk add curl \
    && rm -rf /var/cache/apk/* \
    && mkdir /home/node/app \
    && chown -R node:node /home/node/

WORKDIR /home/node/app

COPY --chown=root:root ./package*.json ./

COPY --chown=root:root ./index.js .

FROM base AS development

RUN npm ci --ignore-scripts --include dev

COPY --chown=root:root ./server ./server

EXPOSE ${PORT} 9229 9230

USER node

CMD [ "node", "index.js" ]

FROM base AS production

RUN npm ci --ignore-scripts --omit dev

COPY --chown=root:root ./server/*.js ./server/
COPY --chown=root:root ./server/plugins/*.js ./server/plugins/
COPY --chown=root:root ./server/routes/*.js ./server/routes/
COPY --chown=root:root ./server/services ./server/services

EXPOSE ${PORT}

USER node

HEALTHCHECK --timeout=5s CMD curl --fail http://localhost:${PORT}/healthcheck || exit 1

CMD [ "node", "index.js" ]
