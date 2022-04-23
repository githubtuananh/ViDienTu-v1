const nodemailer = require("nodemailer");
const fs = require("fs");
require("dotenv").config();

// require models
const userModel = require("../models/user.model");
const blacklistUserModel = require("../models/blacklist.model");


exports.generateRandomLetter = (n) => {
    const listCharacter = "abcdefghijklmnopqrstuvwxyz0123456789`!@#$%^&*?><|"
    let randomString = '';
    for(let i=0; i<n; i++){
        randomString += listCharacter[Math.floor(Math.random() * listCharacter.length)];
    }
    return randomString;
}

exports.generateRandomNumber = (n) => {
    const listNumber = "0123456789"
    let randomString = '';
    for(let i=0; i<n; i++){
        randomString += listNumber[Math.floor(Math.random() * listNumber.length)];
    }
    return randomString;
}

exports.sendEmailRegister = async(email, username, password) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.USER_EMAIL, 
          pass: process.env.PASS_EMAIL,
        },
    });
    const mailOptions = {
        from: "Delta E-Wallet", // sender address
        to: email, // list of receivers
        subject: "Đăng Ký Ví Điện Tử", // Subject line
        // text: "Chức mừng bạn đã đăng ký thành công",
        html: `<h3>Chức mừng bạn đã đăng ký thành công</h3><p>Tài khoản: ${username}</p><p>Mật khẩu: ${password}</p>`,
        // html:  fs.readFileSync(__dirname+`/404.html`),

    }
    let info = await transporter.sendMail(mailOptions);


    //Technique 2
    // var transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //       user: '1303letuananh@gmail.com',
    //       pass: 'kzdtyphnlvxtpucd'
    //     }
    //   });
    //   var mailOptions = {
    //     from: '<Lê Tuấn Anh>',
    //     to: 'tuananh0398547674@gmail.com',
    //     subject: 'CC',
    //     text: 'That was easy!'
    //   };
    //   transporter.sendMail(mailOptions, function(error, info){
    //     if (error) {
    //       console.log(error);
    //     } else {
    //       console.log('Email sent: ' + info.response);
    //     }
    //   });
}

exports.sendEmailResetPassword = async (email, token) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.USER_EMAIL, 
          pass: process.env.PASS_EMAIL,
        },
    });
    const mailOptions = {
        from: "Delta E-Wallet", 
        to: email, 
        subject: "Khôi phục mật khẩu", 
        html: `Nhấn vào đây để khôi phục mật khẩu (Link chỉ tồn tại trong 10 phút) ==> <a href="http://localhost:3000/reset-password/${token}">Khôi phục mật khẩu</a> `,
    }
    let info = await transporter.sendMail(mailOptions);
}

exports.login_attempts = async(req, user) => {
    if(req.session["login_attempts"] == undefined){
        req.session["login_attempts"] = 1;
    }else{
        req.session["login_attempts"] += 1;
    }

    if(req.session["login_attempts"] >= 3){
        req.session["login_attempts"] = 0;
        await userModel.findOneAndUpdate({username: user.username}, {unusual: user.unusual + 1});
        return true;
    }
    return false;
}

exports.addBackList = async(user) => {
    if(user.unusual == 2){
        const userBL = new blacklistUserModel({
            username: user.username,
        })           
        const saveUser = await userBL.save();
        return true;
    }
    return false;
}