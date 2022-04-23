//Require models
const userModel = require("../models/user.model");
const blacklistUserModel = require("../models/blacklist.model");

//Require Other
const formidable = require("formidable");
const fs = require("fs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//Require middleware
const middleware = require("../middleware/validator");

//Require helper
const helper = require("../helper/helper");

// ----------------------------------------------------------------------------
//Change Password
exports.changePassword = async (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({code: 400, message: err.message});
        }
        try{
            //Check fields
            const result = await middleware.chemaChangePassword.validateAsync(fields);
            //Change Password
            const {newPassword, confirmPassword, oldPassword} = fields;
            const user = await userModel.findOne({username: req.user.username});
            if(!user){
                return res.status(400).json({code: 400, message: "Tài khoản không tồn tại"});
            }
            const passwordCorrect = user.password;
            const isPassword = bcrypt.compareSync(oldPassword, passwordCorrect);
            if(!isPassword){
                return res.status(400).json({code: 400, message: "Mật khẩu cũ chính xác"});
            }
            const passwordHash = bcrypt.hashSync(newPassword, 2);
            await userModel.findOneAndUpdate({username: req.user.username}, {password: passwordHash});

            return res.status(200).json({code: 200, message: "Đổi mật khẩu thành công"});
        }catch(err){
            return res.status(400).json({code: 400, message: "Đổi mật khẩu thất bại", error: err});
        }       
    })
}

//Get Info User
exports.getInfoUser = async (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({code: 400, message: err.message});
        }
        try {
            const {username} = fields;
            const user = await userModel.findOne({username});
            const data = user;
            return res.status(200).json({code: 200, message: "Lấy dữ liệu thành công", data});
        } catch (error) {
            return res.status(400).json({code: 400, message: "Lấy ", error: err});
        }
    })
}

//Get 
// ---------------------------------------------------------
exports.test = async(req, res) => {
    const user = new blacklistUserModel({
        username: "tuan",
    })           
    const saveUser = await user.save();

    const user1 = new lockUserUserModel({
        username: "tuan",
    })           
    const saveUser1 = await user1.save();
    res.end("end");
}




