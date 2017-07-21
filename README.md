# QzMonitorBit
Multi-purpose tools for monitoring. Monitor http request, websocket and system performance, then listen it live via websocket or read the saved log.

# Contents
1. [What this app is capable of](#description)
2. [Installation](#installation)
3. [Configuration](#configuration)

<a name="description"></a>
## What this app is capable of

This app is has multiple monitoring functionality and act both as client and server as same time. The functionalities are:

### As Client - Monitor http request

This app can be configured to perform http request to specified url periodically. The result and status code later will be compared with expected value configured beforehand. If the request failed or response from server isn't same with expected, an error will be provided and sent via configured notification.

### As Client - Monitor websocket availability (incomplete)

This app can be configured to connect to a websocket of specified url, then emitting data (configured) periodically. Any recieved data from event handler will be compared with expectation. If mismatch with expectation, or connection to websocket cannot be made, will be raised as error and notified.

### As Server - Log server status

This app will capture server performance periodically. Both cpu and memory usage will be captured. The captured performance will be logged in file and emitted via websocket.

Please note that memory usage in linux is different than windows, and information stored may be not reflecting the correct usage.

### As Client - Monitor TCP request (planned)

This app is planned to make TCP request to specific address and port. The response will be compared and error will be raised if the response isn't match with expected, or request cannot be made.

### Notify via email

Any monitoring error, and server recovery can be configured to be sent by email. 

### Notify via websocket

Any monitoring error and info can be configured to be sent by websocket.

### Notify via api (planned)

Any monitoring error and info is planned to be sent by http request.

<a name="installation"></a>
## Installation

You will need to have [node js](https://nodejs.org/) installed.

Execute the following script:

```
git clone https://github.com/fendy3002/QzMonitorBit.git QzMonitorBit;

cd QzMonitorBit;

npm install;

npm start;
```

<a name="configuration"></a>
## Configuration

See [configuration](/CONFIG.md).