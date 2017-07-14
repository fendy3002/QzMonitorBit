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
        "config": appConfig.mail[moduleMail.use], 
        "to": moduleMail.to
    };

    var error = function(actual){
        var transporter = nodemailer.createTransport(mailConfig.config.transporter);
        var body = getText(module, actual, mailConfig.config.message)
        var mailOptions = {
            from: mailConfig.config.from,
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
        flush
    };
};

export default Service;