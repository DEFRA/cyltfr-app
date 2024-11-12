# Compose file for running as a service

You must first build the debug containers for each of the services. This can be done by

`npm run container:builddebug`

You can then put an environment file in this directory for each container.

You can then run the service as a whole by running

`docker compose up -d`

# Environment setup

Each environment file will need specific things in for the inter-container communication.

## app

SERVICE_URL=http://service:8050

## service

RISK_DATA_URL=http://data:8051/extra_info

## data

STAND_ALONE=true
