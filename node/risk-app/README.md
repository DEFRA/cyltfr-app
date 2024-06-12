# Long term flood risk information (ltfri)

## Flood Risk App component (flood-risk-app)

### Build app

`npm run build`

### Start app

`npm start`

### Test app

`npm test`

# Environment variables (TODO: These are currently loaded via the config/server.json file not env vars)
| name     |      description      | required  |   default   |            valid            | notes |
|----------|-----------------------|:---------:|-------------|:---------------------------:|-------|
| NODE_ENV | Node environment      |    no     | development | development,test,production |       |

# Prerequisites

Node v12+

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