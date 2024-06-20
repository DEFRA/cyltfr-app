# Long term flood risk information (ltfri)

## Flood Risk Service component (flood-risk-service)

### Start service

`npm start`

### Test service

`npm test`

### Use service

do http `GET` on `http://{host}:{port}/floodrisk/{x}/{y}/radius`

# Environment variables (TODO: These are currently loaded via the config/server.json file not env vars)
| name     |      description      | required  |   default   |            valid            | notes |
|----------|-----------------------|:---------:|-------------|:---------------------------:|-------|
| NODE_ENV | Node environment      |    no     | development | development,test,production |       |
| HOST     | Hostname              |    yes    |             |                             |       |
| PORT     | Port number           |    yes    |             |                             |       |
| DB       | DB Connection String  |    yes    |             |                             |       |

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