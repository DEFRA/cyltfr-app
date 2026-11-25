# Check Your Long Term Flood Risk Services 

# v5.12.0

## Release date 3 December 2026

### Updates

LTFRI-2437 Maintenance on the github actions
LTFRI-2638 GOV.UK Frontend 6.6.0 update
LTFRI-2709 Restyle summary page actions & add secondary action for users eligible for flood warnings

### Release instructions
This is using our standard change process.

In the standby production environment (Green or Blue) run the following Jenkins deploy jobs for each service to be updated. Please do this in this order, as the automated test run after an 'app' deployment.

job/service_(blue/green)/job/deploy_service_01 v6.4.4
job/data_(blue/green)/job/deploy_data_01 v5.5.3
job/app_(blue/green)/job/deploy_app_01 v5.12.0
job/admin_(blue/green)/job/deploy_admin_01 v5.7.0

QA will test standby environment
Switch standby to live
Test live environment
Update standby environment using same steps as above.

Post deployment each service should have the following images deployed.
cyltfr-app v5.11.0
cyltfr-service v6.4.3
cyltfr-data v5.5.2
cyltfr-admin v5.7.0