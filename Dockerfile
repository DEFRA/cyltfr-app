ARG PARENT_VERSION=2.2.2-node20.11.1

FROM defradigital/node:${PARENT_VERSION} AS base
ARG PORT=3000
ENV PORT=${PORT}

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

COPY --chown=root:root ./bin/ ./bin/

COPY --chown=root:root ./client/ ./client/

COPY --chown=root:root ./.husky/ ./.husky/

COPY --chown=root:root ./webpack.config.js .

RUN npm ci --ignore-scripts --include dev

COPY --chown=root:root ./server/ ./server/

RUN npm run build

EXPOSE ${PORT} 9229 9230

RUN apk add aws-cli \
    && apk cache clean \
    && mkdir /home/node/app/server/simulated_data \
    && chown node:node /home/node/app/server/simulated_data

USER node

CMD [ "bin/start-dev" ]

FROM base AS production

RUN npm ci --ignore-scripts --omit dev

COPY --chown=root:root ./server/*.js ./server/
COPY --chown=root:root ./server/models/*.js ./server/models/*.json ./server/models/
COPY --chown=root:root ./server/plugins/*.js ./server/plugins/
COPY --chown=root:root ./server/routes/*.js ./server/routes/
COPY --chown=root:root ./server/routes/simulated/*.js ./server/routes/simulated/
COPY --chown=root:root ./server/routes/simulated/data/*.* ./server/routes/simulated/data/
COPY --chown=root:root ./server/server-methods/*.js ./server/server-methods/
COPY --chown=root:root ./server/services/*.js ./server/services/
COPY --chown=root:root ./server/views/ ./server/views/
COPY --chown=root:root ./server/models/definition/ ./server/models/definition/

COPY --from=development --chown=root:root /home/node/app/server/public/ ./server/public/

EXPOSE ${PORT}

USER node

HEALTHCHECK --timeout=5s CMD curl --fail http://localhost:${PORT}/healthcheck || exit 1

CMD [ "node", "index.js" ]
