import nodemailer from 'nodemailer';
import appConfig from '../../config/app.js';
import dateformat from 'dateformat';

var getAccess = (module) => {
    if(module.type = "http"){ return module.url + ":" + module.method }
    return "";
}
var getText = function(module, actual, message){
    var toParse = {
        "%NAME%" : module.name,
        "%NOW%" : dateformat(actual.time.end, "yyyymmmdd hh:MM:dd"),
        "%ACCESS%" : getAccess(module),
        "%ACTUAL" : actual
    };

    return {
        text: message.text.replace(/%\w+%/g, function(all) {
            return toParse[all] || all;
        }),
        html: message.html.replace(/%\w+%/g, function(all) {
            return toParse[all] || all;
        })
    };
};
var Service = function(module){
    var moduleMails = module.notify.email;
    var mailConfigs = lo.map(moduleMails, k=> (
        {
            "config": appConfig.mail[k.use], 
            "to": k.to
        }
    ) );

    var error = function(actual){
        lo.forEach(mailConfigs, mailConfig => {
            var transporter = nodemailer.createTransport(mailConfig.config.transporter);
            var body = getText(module, actual, mailConfig.config.message)
            var mailOptions = {
                from: mailConfig.config.from,
                to: mailconfig.to,
                subject: mailConfig.config.message.subject,
                text: body.text,
                html: body.html
            };

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        });
    };
    var flush = function(buffer){
        
    };
};

export default Service;