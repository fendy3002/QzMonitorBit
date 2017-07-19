import nodemailer from 'nodemailer';
import dateformat from 'dateformat';
import context from "../context.js";

var getAccess = (module) => {
    if(module.type = "http"){ return module.url + ":" + module.method }
    return "";
}
var getText = function(module, actual, message){
    var toParse = {
        "%NAME%" : module.name,
        "%NOW%" : dateformat(actual.time.end, "yyyymmmdd hh:MM:dd"),
        "%ACCESS%" : getAccess(module),
        "%ACTUAL%" : JSON.stringify(actual, null, 2)
    };

    return {
        text: message.text.replace(/%\w+%/g, function(all) {
            return toParse[all] || all;
        }),
        html: message.html.replace(/%\w+%/g, function(all) {
            return toParse[all] || all;
        }),
        subject: message.subject.replace(/%\w+%/g, function(all) {
            return toParse[all] || all;
        })
    };
};
var Service = function(module, moduleMail, callback){
    var appConfig = context.appConfig;
    var mailConfig = {
        "sender": appConfig.sender[moduleMail.use],
        "mail": appConfig.mail[module.type],
        "to": moduleMail.to
    };
    var errorEscalation = 0;
    var lastSendMail = null;
    var errSending = false;
    var recSending = false;

    var error = function(actual){
        if(errSending){
            return;
        }
        errSending = true;
        var currentDate = new Date();
        if(errorEscalation > 0){
            var escalationTimeInSec = appConfig.escalation[errorEscalation] || appConfig.escalation.after;
            var escalationTime = escalationTimeInSec * 1000;
            var diffTime = currentDate.getTime() - lastSendMail.getTime();
            // if in no time to escalate
            if(diffTime < escalationTime){
                errSending = false;
                return;
            }
        }

        var transporter = nodemailer.createTransport(mailConfig.sender.transporter);
        var body = getText(module, actual, mailConfig.mail.error);
        var mailOptions = {
            from: mailConfig.sender.from,
            to: mailConfig.to,
            subject: body.subject,
            text: body.text,
            html: body.html
        };
        transporter.sendMail(mailOptions, function(error, info){
            errorEscalation++;
            lastSendMail = currentDate;
            errSending = false;
            callback(error, info);
        });
    };
    var recover = function(actual){
        if(recSending){ return; }
        // drop if no error beforehand
        if(errorEscalation == 0){ 
            callback(null, {});
            return;
        }
        recSending = true;
        var transporter = nodemailer.createTransport(mailConfig.sender.transporter);
        var body = getText(module, actual, mailConfig.mail.recover);
        var mailOptions = {
            from: mailConfig.sender.from,
            to: mailConfig.to,
            subject: body.subject,
            text: body.text,
            html: body.html
        };
        transporter.sendMail(mailOptions, function(error, info){
            recSending = false;
            errorEscalation = 0;
            lastSendMail = null;
            callback(error, info);
        });
    };
    var flush = function(buffer){
        callback(null, null);
    };

    return {
        error,
        recover,
        flush
    };
};

export default Service;