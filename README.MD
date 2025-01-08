[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-app&metric=alert_status)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-app)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-app&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-app)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-app&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-app)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-app&metric=security_rating)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-app)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-app&metric=ncloc)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-app)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-app&metric=bugs)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-app)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-app&metric=code_smells)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-app)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-app&metric=sqale_index)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-app)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_cyltfr-app&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=DEFRA_cyltfr-app)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![GitHub issues](https://img.shields.io/github/issues/DEFRA/cyltfr-app.svg)](https://github.com/DEFRA/cyltfr-app/issues/)
[![Code size](https://img.shields.io/github/languages/code-size/DEFRA/cyltfr-app.svg)]()
[![Repo size](https://img.shields.io/github/repo-size/DEFRA/cyltfr-app.svg)]()
[![Licence](https://img.shields.io/badge/licence-OGLv3-blue.svg)](http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3)

# Check Your Long Term Flood Risk Services Front end application (cyltfr-app)
Repo for the Check Your Long Term Flood (CYLTFR) service front end application.

This repository is part of the CYLTFR service which also includes:\
<https://github.com/DEFRA/cyltfr-service>\
<https://github.com/DEFRA/cyltfr-data>\
<https://github.com/DEFRA/cyltfr-admin>

## Prerequisites
Node v20.x\
Docker v20.10.0+

### Build app

`npm run build`

### Start app

`npm start`

### Test app

`npm test`

# Environment variables
| name                        |      description                        | required  |   default   |            valid            | notes |
|-----------------------------|-----------------------------------------|:---------:|-------------|:---------------------------:|-------|
| NODE_ENV                    | Node environment                        |    no     | development | development,test,production |       |
| RISK_APP_HOST               | Host server IP                          |   yes     |             |                             |       |
| PORT                        | Server port #                           |   yes     |             |                             |       |
| SERVICE_URL                 | Service API                             |   yes     |             |                             |       |
| SIMULATE_ADDRESS_SERVICE    | Mocks address service for testing       |    no     | false       |                             |       |
| DATA_VERSION                | Which data version will be used for maps|    no     | 01          |                             |       |
| PERFORMANCE_LOGGING         | If true, will log performance of external calls | no | false      |                             |       |
| HTTP_TIMEOUT_MS             | Timeout in ms                           |   yes     |             |                             |       |
| G4_ANALYTICS_ACCOUNT        | GA ID                                   |    no     |             |                             |       |
| GTAG_MANAGER_ID             | GTM ID                                  |    no     |             |                             |       |
| FLOOD_WARNINGS_URL          | Flood warning API                       |   yes     |             |                             |       |
| FLOOD_RISK_URL              | Flood risk API                          |   yes     |             |                             |       |
| OS_POSTCODE_URL             | OS postcode API                         |   yes     |             |                             |       |
| OS_MAPS_URL                 | OS map API                              |   yes     |             |                             |       |
| OS_SEARCH_KEY               | OS search key                           |   yes     |             |                             |       |
| OS_MAPS_KEY                 | OS map key                              |   yes     |             |                             |       |
| OS_MAPS_SECRET              | OS map secret key                       |   yes     |             |                             |       |
| OS_TOKEN_ENDPOINT           | End point to OS OAuth token generation  |   no      | https://api.os.uk/oauth2/token/v1 |                             |       |
| OS_TOKEN_EXPIRY_TIME        | Map token expiry time in ms             |    no     |60 * 60 *1000|                             |       |
| http_proxy                  | Proxy that is used for external calls by the service |    no     |             |                             |       |
| RATE_LIMIT_ENABLED          | Enable limit on postcode requests       |    no     | false       |                             |       |
| RATE_LIMIT_REQUESTS         | Amount of requests per user             |    no     |             |                             |       |
| RATE_LIMIT_EXPIRES_IN       | Time user request limit expires         |    no     |             |                             |       |
| RATE_LIMIT_WHITELIST        | Limit enabled user exceptions           |   yes     | []          |                             |       |
| REDIS_CACHE_ENABLED         | Redis cache storing enabled             |    no     | false       |                             |       |
| REDIS_TLS                   | Redis cache requires TLS for connection |    no     | false       |                             |       |
| REDIS_CACHE_HOST            | Redis linked AWS server URI             |    no     |             |                             |       |
| REDIS_CACHE_PORT            | Redis default port                      |    no     | 6379        |                             |       |
| COOKIE_PASSWORD             | Password to prevent exposing cookie data |  yes    |             |                             |       |
| FRIENDLY_CAPTCHA_ENABLED    | Friendly Captcha robot check enabled    |    no     | false       |                             |       |
| FRIENDLY_CAPTCHA_SITE_KEY   | Key for site for Catcha check           |    no     |             |                             |       |
| FRIENDLY_CAPTCHA_SECRET_KEY | Secret key for website captcha          |    no     |             |                             |       |
| FRIENDLY_CAPTCHA_URL        | Friendly Captcha API                    |    no     |             |                             |       |
| FRIENDLY_CAPTCHA_BYPASS     | Friendly Capctha bypass key             |    no     |             |                             |       |
| SESSION_TIMEOUT             | Timeout for session cookies of 10 minutes |    no     | 10          |                             |       |
| CACHE_ENABLED               | If disabled external APIs will not be cached |    no     | true        |                             |       |
| ERRBIT_POST_ERRORS          | Allow Errbit errors to be sent for post requests |   yes     |             |                             |       |
| ERRBIT_ENV                  | Option for info of of which environment is sent to Errbit |   yes     |             |                             |       |
| ERRBIT_KEY                  | Key for Errbit error logging            |   yes     |             |                             |       |
| ERRBIT_HOST                 | Server IP for where Errbit is hosted    |   yes     |             |                             |       |
| ERRBIT_PROXY                | Errbit proxy                            |    no     |             |                             |       |
| ESRI_CLIENT_ID              | ESRI Client ID                          |   yes     |             |                             |       |
| ESRI_CLIENT_SECRET          | ESRI Client Secret                      |   yes     |             |                             |       |

For testing production (P01) ESRI layers get the Client ID and Secret from either Matthew C or Paul S.

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

## License
THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

>Contains public sector information licensed under the Open Government licence v3

### About the license
The Open Government Licence (OGL) was developed by the Controller of His Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
