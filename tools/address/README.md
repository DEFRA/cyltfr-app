# Address data fetch tool

Used for storing simulated address data for performance testing. Use this to build a directory of test
data that can be used when in simulated address mode.

This is so that performance tests do not invoke the OS Address API and hit the known limits of that API

# Environment variables

OS_POSTCODE_URL
OS_SEARCH_KEY

# Running the application

`$ node index.mjs /inputfile/`