# Configuration
## app.js

|Field | Description |
| ----- | ----- |
| port | Specify port for MonitorBit websocket |
| logEvery | In seconds. Specify how long app need to wait before dumping info to log. Default 600 (10 minutes) |
| cpuInterval | In seconds. Specify interval the app will capture system performance periodically. Default 5 seconds. |
| monitorbit | Boolean. If false then the app won't capture system performance periodically. Default true. |
| listener | See [listener](#app_listener). |
| escalation | See [escalation](#app_escalation). |
| sender | nodemailer transporter mail configuration. For more info, see [nodemailer](https://nodemailer.com) |
| mail | Mail subject and body template for notification. See [mail](#app_mail). |

<a name="app_listener"></a>
### app.js listener

Global configuration for listener-specific.

|Field | Description |
| ----- | ----- |
| http.timeout | Specify timeout for http request in listener. Default 5 seconds. |
| http.error | Specify error message for different error type for http listener. |
| websocket.connectEscalation | Specify error message for different error type for http listener. |
| websocket.error | Specify error message for different error type for websocket listener. |


<a name="app_escalation"></a>
### app.js escalation

Escalation is a set of configuration that decide when the next e-mail notification will be sent. It's purpose is to avoid spam the recipient's e-mail if a server is down for some times or the recipient cannot respond in time. It keeps the value in second. Example of escalation:

```
{
    "1": 10,
    "2": 60, // 1 minute
    "3": 300, // 5 minute
    "4": 600, // 10 minutes
    "5": 3600, // 1 hour
    "after": 14400 // 4 hour
}
```

It means that after first notification, it will send next error notification only after 10 second, then 1 minute, 5 minutes and so on, until it's stuck at 4 hour. Escalation reset when server recovered.

<a name="app_mail"></a>
### app.js mail

<a name="escalation"></a>
## Escalation