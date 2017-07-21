{
    "name": "Server 1",
    "type": "http",
    "url": "https://httpbin.org/get",
    "method": "get",
    "expect": {
        "code": 200,
        "header": {
            "content-type": "application/json"
        }
    },
    "interval": 10, // in seconds
    "notify": {
        "email": [{
            "use": "default",
            "to": "first.person@mail.com, second.person@mail.com"
        }],
        "websocket": true,
        "api": [{"https": ""}]
    }
}