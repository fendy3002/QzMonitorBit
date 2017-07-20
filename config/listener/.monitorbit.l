{    
    "name": "CRD CDN",
    "type": "websocket",
    "url": "http://127.0.0.1:3000/monitorbit/",
    "emit": {
        "ping": {
            "data": {"message": "1234"},
            "interval": 10, // in second
            "on": {
                "reply": {
                    "expected": {"message": "1234"}
                }
            }
        }
    },
    "on": {
        "signal": {
            "expected": {"source": "MonitorBit"}
        }
    },
    "notify": {
        "email": [{
            "use": "default",
            "to": "fendy.heryanto@coderscolony.com"
        }],
        "api": [{"https": ""}]
    }
}