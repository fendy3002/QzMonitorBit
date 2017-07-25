# Configuration
## app.js

|Field | Description |
| ----- | ----- |
| port | Specify port for MonitorBit websocket |
| logEvery | In seconds. Specify how long app need to wait before dumping info to log. Default 600 (10 minutes) |
| cpuInterval | In seconds. Specify interval the app will capture system performance periodically. Default 5 seconds. |
| monitorbit | Boolean. If false then the app won't capture system performance periodically. Default true. |
| listener | See [listener](#app_listener). |
| mail | Mail subject and body template for notification. See [mail](#app_mail). |

<a name="app_listener"></a>
### app.js listener

Global configuration for listener-specific.

|Field | Description |
| ----- | ----- |
| http.timeout | Specify timeout for http request in listener. Default 5 seconds. |
| http.error | Specify error message for different error type for http listener. |
| websocket.connectEscalation | Specify [escalation](#escalation) for websocket connection. It decides when the next reconnection attempt will be attempted, after 5 retries. Reset when making successful connection to server |
| websocket.error | Specify error message for different error type for websocket listener. |

<a name="app_mail"></a>
### app.js mail

Specify configurations for mail-related notification.

|Field | Description |
| ----- | ----- |
| escalation | Specify [escalation](#escalation) for sending email, to prevent spam. It decides when the next mail will be sent. Reset when server is recovered. |
| http.error | Specify mail template for http error. |
| http.recover | Specify mail template for when http request recovered. |
| websocket.error | Specify mail template for websocket error. |
| websocket.recover | Specify mail template for when websocket server recovered. |
| sender | nodemailer transporter mail configuration. For more info, see [nodemailer](https://nodemailer.com) |

<a name="escalation"></a>
## Escalation

Escalation is a set of configuration that decide when the next action will be performed. It's purpose is to avoid spam the recipient's e-mail if a server is down for some times or the recipient cannot respond in time. It keeps the value in second. Example of escalation:

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

It means that after execution, it will perform next execution only after 10 second, then 1 minute, 5 minutes and so on, until it's stuck at every 4 hour. Escalation can be reset.

## Listener

All listener configuration are stored in `config/listener` folder. All file with prefix dot `.` will be ignored, such as the example `.httpbin.l` and `monitorbit.l`. File extension `.l` is optional but recommended, as the further development will consider the `.l` file extension.