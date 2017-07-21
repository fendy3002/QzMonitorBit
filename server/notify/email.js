import nodemailer from 'nodemailer';
import dateformat from 'dateformat';
import escalationRaw from '../escalation';
import context from "../context.js";

var getAccess = (module) => {
    if(module.type = "http"){ return module.url + ":" + module.method }
    else if(module.type = "websocket"){ return module.url }
    return "";
}
var getTime = (module, actual) => {
    if(module.type = "http"){ return actual.time.end; }
    else if(module.type = "websocket"){ return actual.time; }
    return null;
};

var getText = function(module, actual, message){
    var toParse = {
        "%NAME%" : module.name,
        "%NOW%" : dateformat(getTime(module, actual), "yyyymmmdd hh:MM:dd"),
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
    var escalation = escalationRaw(appConfig.escalation);

    var error = function(actual){
        escalation.exec((done) => {
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
                callback(error, info);
                done();
            }); 
        });
    };
    var recover = function(actual){
        // drop if no error beforehand
        if(escalation.times() == 0){ 
            callback(null, {});
            return;
        }
        else{
            escalation.reset();
        }

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