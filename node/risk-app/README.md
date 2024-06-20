# Long term flood risk information (ltfri)

## Flood Risk App component (flood-risk-app)

### Build app

`npm run build`

### Start app

`npm start`

### Test app

`npm test`

# Environment variables (TODO: These are currently loaded via the config/server.json file not env vars)
| name                        |      description                        | required  |   default   |            valid            | notes |
|-----------------------------|-----------------------------------------|:---------:|-------------|:---------------------------:|-------|
| NODE_ENV                    | Node environment                        |    no     | development | development,test,production |       |
| RISK_APP_HOST               | Host server IP                          |   yes     |             |                             |       |
| PORT                        | Server port #                           |   yes     |             |                             |       |
| GEOSERVER_URL               | Geoserver API                           |   yes     |             |                             |       |
| SERVICE_URL                 | Service API                             |   yes     |             |                             |       |
| SIMULATE_ADDRESS_SERVICE    | Mocks address service for testing       |    no     | false       |                             |       |
| HTTP_TIMEOUT_MS             | Timeout in ms                           |   yes     |             |                             |       |
| G4_ANALYTICS_ACCOUNT        | GA ID                                   |    no     |             |                             |       |
| GTAG_MANAGER_ID             | GTM ID                                  |    no     |             |                             |       |
| FLOOD_WARNINGS_URL          | Flood warning API                       |   yes     |             |                             |       |
| FLOOD_RISK_URL              | Flood risk API                          |   yes     |             |                             |       |
| OS_POSTCODE_URL             | OS postcode API                         |   yes     |             |                             |       |
| OS_CAPABILITIES_URL         | OS capabilites API                      |   yes     |             |                             |       |
| OS_MAPS_URL                 | OS map API                              |   yes     |             |                             |       |
| OS_SEARCH_KEY               | OS search key                           |   yes     |             |                             |       |
| OS_MAPS_KEY                 | OS map key                              |   yes     |             |                             |       |
| http_proxy                  | Proxy that is used for external calls by the service |    no     |             |                             |       |
| RATE_LIMIT_ENABLED          | Enable limit on postcode requests       |    no     | false       |                             |       |
| RATE_LIMIT_REQUESTS         | Amount of requests per user             |    no     |             |                             |       |
| RATE_LIMIT_EXPIRES_IN       | Time user request limit expires         |    no     |             |                             |       |
| RATE_LIMIT_WHITELIST        | Limit enabled user exceptions           |   yes     | []          |                             |       |
| REDIS_CACHE_ENABLED         | Redis cache storing enabled             |    no     | false       |                             |       |
| REDIS_CACHE_HOST            | Redis linked AWS server URI             |    no     |             |                             |       |
| REDIS_CACHE_PORT            | Redis default port                      |    no     | 6379        |                             |       |
| COOKIE_PASSWORD             | Password to prevent exposing cookie data |  yes    |             |                             |       |
| FRIENDLY_CAPTCHA_ENABLED    | Friendly Captcha robot check enabled    |    no     | false       |                             |       |
| FRIENDLY_CAPTCHA_SITE_KEY   | Key for site for Catcha check           |    no     |             |                             |       |
| FRIENDLY_CAPTCHA_SECRET_KEY | Secret key for website captcha          |    no     |             |                             |       |
| FRIENDLY_CAPTCHA_URL        | Friendly Captcha API                    |    no     |             |                             |       |
| FRIENDLY_CAPTCHA_BYPASS     | Friendly Capctha bypass key             |    no     |             |                             |       |
| SESSION_TIMEOUT             | Timeout for session cookies of 10 minutes |    no     | 10          |                             |       |
| RISK_PAGE_FLAG              | Flag to allow view of updated risk pages |   no    | false       |                             |       |
| CACHE_ENABLED               | If disabled external APIs will not be cahced |    no     | true        |                             |       |
| ERRBIT_POST_ERRORS          | Allow Errbit errors to be sent for post requests |   yes     |             |                             |       |
| ERRBIT_ENV                  | Option for info of of which environment is sent to Errbit |   yes     |             |                             |       |
| ERRBIT_KEY                  | Key for Errbit error logging            |   yes     |             |                             |       |
| ERRBIT_HOST                 | Server IP for where Errbit is hosted    |   yes     |             |                             |       |
| ERRBIT_PROXY                | Errbit proxy                            |    no     |             |                             |       |

# Prerequisites

Node v20+

# Running the application locally

`$ node index.js`

# Debugging the application in docker using vscode

First build the debug image using

`$ npm run container:builddebug`

Configure vscode using a debug configuration launch.json like

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "address": "0.0.0.0",
      "name": "Attach",
      "port": 9229,
      "request": "attach",
      "skipFiles": [
        "<node_internals>/**"
      ],
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "/home/node/app",
      "type": "node"
    }
  ]
}
```

Then you can run the container in debug mode using

`$ npm run container:debug`

or 

`$ npm run cd`

This maps your source directory into the container, so that you can make changes locally and they'll be reflected in the container.

If you have auto-attach configured in vscode you might need to disable it for this to work.

When you have finished end the debug container using

`$ npm run container:stopdebug`

or 

`$ npm run cx`