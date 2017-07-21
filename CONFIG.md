# Configuration
## app.js

----------
|Field | Description |
----------
| port | Specify port for MonitorBit websocket |
| logEvery | In seconds. Specify how long app need to wait before dumping info to log. Default 600 (10 minutes) |
| cpuInterval | In seconds. Specify interval the app will capture system performance periodically. Default 5 seconds. |
| monitorbit | Boolean. If false then the app won't capture system performance periodically. Default true. |
| listener | See [listener](#app_listener). |
| escalation | See [escalation](#app_escalation). |
| sender | nodemailer transporter mail configuration. For more info, see [nodemailer](https://nodemailer.com) |
| mail | Mail subject and body template for notification. See [mail](#app_mail). |
----------