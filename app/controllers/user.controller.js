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

//Update CMND
exports.updateCMND = async (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({code: 400, message: err.message});
        }
        const  front_cmnd = files.front_cmnd;
        const  back_cmnd = files.back_cmnd;

        if(front_cmnd == undefined || back_cmnd == undefined){
            return  res.status(400).json({code: 400, message: "Vui lòng chọn ảnh CMND"});
        }else{
            const  extFront_cmnd = front_cmnd.mimetype;
            const  extBack_cmnd = back_cmnd.mimetype;
            if((extFront_cmnd == "image/jpeg" || extFront_cmnd == "image/png") && (extBack_cmnd == "image/jpeg" || extBack_cmnd == "image/png")){
                const cmnd = [front_cmnd.newFilename, back_cmnd.newFilename];
                const pathUploadCmnd = "./public/image/cmnd/";
                const dest =  pathUploadCmnd + front_cmnd.newFilename;
                const dest1 =  pathUploadCmnd + back_cmnd.newFilename;
                //Upload CMND
                try{
                    fs.copyFileSync(front_cmnd.filepath, dest);
                    fs.copyFileSync(back_cmnd.filepath, dest1);
                }catch(err){
                    return res.status(500).json({code: 500, message: "Lỗi upload file", error: err});
                }
                //Update in DB
                try{
                    const user = await userModel.findOne({username: req.user.username});
                    const destOld = pathUploadCmnd + user.cmnd[0];
                    const destOld1 = pathUploadCmnd + user.cmnd[1];
                    console.log(destOld);
                    fs.unlinkSync(destOld);  //Remove cmnd old
                    fs.unlinkSync(destOld1); //Remove cmnd old

                    await userModel.findOneAndUpdate({username: req.user.username}, {cmnd});
                    return res.status(200).json({code: 200, message: "Cập nhật thành công"});
                }catch (err){
                    fs.unlinkSync(dest);    //Remove File CMND If Add User Failed 
                    fs.unlinkSync(dest1);   //Remove File CMND If Add User Failed

                    return res.status(500).json({code: 500, message: "Cập nhật CMND thất bại", error: err});
                }           
            }else{
                return  res.status(400).json({code: 400, message: "File ảnh không hợp lệ !"});
            }
        }
    })
}

//Get 
// ---------------------------------------------------------
exports.test = async(req, res) => {
    res.end("test");
}




