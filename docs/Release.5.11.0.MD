# Check Your Long Term Flood Risk Services 

# v5.11.0

## Release date 10 November 2026

### Updates

LTFRI-2643 Remove 'no data available' on map legend
LTFRI-2667 Remove layer styling override on RoFSW layer
LTFRI-2693 Fix dependency issues for 5.27.0

### Release instructions
This is using our standard change process.

In the standby production environment (Green or Blue) run the following Jenkins deploy jobs for each service to be updated. Please do this in this order, as the automated test run after an 'app' deployment.

job/service_(blue/green)/job/deploy_service_01 v6.4.3
job/data_(blue/green)/job/deploy_data_01 v5.5.2
job/app_(blue/green)/job/deploy_app_01 v5.11.0

QA will test standby environment
Switch standby to live
Test live environment
Update standby environment using same steps as above.

Post deployment each service should have the following images deployed.
cyltfr-app v5.11.0
cyltfr-service v6.4.3
cyltfr-data v5.5.2