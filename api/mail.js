const nodemailer = require("nodemailer");
const xoauth2 = require('xoauth2');

var smtpTransport = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: 'edumeetinc@outlook.com',
        pass: 'Alperenismailmustafa#.'
    }
});
var rand,mailOptions,host,link;

module.exports = async (email,subject,html)=>{
    mailOptions={
        from: 'edumeetinc@outlook.com', // sender address
        to : email,
        subject : subject,
        html : html
    }
    await smtpTransport.sendMail(mailOptions);
}

