//Require models
const userModel = require("../models/user.model");
const blacklistUserModel = require("../models/blacklist.model");
const resetTokenModel = require("../models/resetToken.model");


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
//Register
exports.register =  async (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({code: 400, message: err.message});
        }

        //Check Fields
        try{
            const result = await middleware.schemaRegister.validateAsync(fields);
        }catch(err){
            return res.status(400).json({code: 400, message: err});
        }
        
        //Check File
        const  front_cmnd = files.front_cmnd;
        const  extFront_cmnd = front_cmnd.mimetype;
        const  back_cmnd = files.back_cmnd;
        const  extBack_cmnd = back_cmnd.mimetype;
        
        if(front_cmnd.originalFilename == '' || back_cmnd.originalFilename == ''){
            return  res.status(400).json({code: 400, message: "Vui lòng chọn ảnh CMND"});
        }else{
            //Check Extension And Upload
            if((extFront_cmnd == "image/jpeg" || extFront_cmnd == "image/png") && (extBack_cmnd == "image/jpeg" || extBack_cmnd == "image/png")){
                const cmnd = [front_cmnd.newFilename, back_cmnd.newFilename];
                const {name, phone, email, birthday, address} = fields;

                const pathUploadCmnd = "./public/image/cmnd/";
                const dest =  pathUploadCmnd + front_cmnd.newFilename;
                const dest1 =  pathUploadCmnd + back_cmnd.newFilename;

                //Random username and password
                const username = helper.generateRandomNumber(10);
                const password = helper.generateRandomLetter(6);

                //Upload CMND
                try{
                    fs.copyFileSync(front_cmnd.filepath, dest);
                    fs.copyFileSync(back_cmnd.filepath, dest1);
                }catch(err){
                    return res.status(500).json({code: 500, message: "Lỗi upload file", error: err});
                }

                //Add User
                try{
                    const passwordHash = bcrypt.hashSync(password, 2);
                    // bcrypt.compareSync(password, passwordHash);

                    const user = new userModel({
                        email,name,phone,birthday,address,cmnd,username, password:passwordHash,
                    })           
                    const saveUser = await user.save();
                }catch (err){
                    fs.unlinkSync(dest);    //Remove File CMND If Add User Failed 
                    fs.unlinkSync(dest1);   //Remove File CMND If Add User Failed

                    return res.status(500).json({code: 500, message: "Lỗi thêm user vào DB", error: err});
                }                

                //Send Email
                try {
                    const result = await helper.sendEmailRegister(email, username, password);

                    //Return Data  If Register Success
                    return  res.status(200).json({
                        code: 200, 
                        message: "Đăng ký thành công (Tài khoản và mật khẩu sẽ được gửi đến email)",
                        data: {infoUser: fields, cmnd: {cmnd: dest, cmnd1: dest1}},
                    });
                } catch (err) {

                    fs.unlinkSync(dest);                        //Remove File CMND If Add User Failed 
                    fs.unlinkSync(dest1);                       //Remove File CMND If Add User Failed
                    await userModel.deleteOne({email, phone})   //Remove User If Send Email Failed

                    return  res.status(500).json({code: 500, message: "Gửi email thất bại", error: err});
                }    

            }else{
                return  res.status(400).json({code: 400, message: "File ảnh không hợp lệ !"});
            }
        }
    })
}

//Login
exports.login = async (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({code: 400, message: err.message});
        }
        try{
            //Check Fields
            const result = await middleware.chemaLogin.validateAsync(fields);
            const {username, password} = fields;
            //Locked account 1m
            if(req.session.locked != undefined && req.session.userlocked == username){
                if(Date.now() - req.session.locked < 60*1000){
                    return res.status(400).json({code: 400, message: "Tài khoản hiện đang bị tạm khóa, vui lòng thử lại sau 1 phút"});
                }
            }
            //Disable account
            const userBlackList = await blacklistUserModel.findOne({username});
            if(userBlackList){
                return res.status(400).json({code: 400, message: "Tài khoản đã bị khóa do nhập sai mật khẩu nhiều lần, vui lòng liên hệ quản trị viên để được hỗ trợ"});
            }       
            
            const user = await userModel.findOne({username});
            if(user){ //Check User Exists
                //Check Password
                const passwordCorrect = user.password;
                const isPassword = bcrypt.compareSync(password, passwordCorrect);
                if(!isPassword){
                    // Prevent user from login
                    const login_attempt = await helper.login_attempts(req, user);
                    if(login_attempt){
                        const user1 = await userModel.findOne({username});
                        const black_list = await helper.addBackList(user1);
                        if(black_list){
                            return res.status(400).json({code: 400, message: "Nhấp sai quá nhiều lần, bị khóa tài khoản"});
                        }
                        req.session.locked = Date.now();
                        req.session.userlocked = username;
                        return res.status(400).json({code: 400, message: "Nhập sai mật khẩu 3 lần liên tục, bị khóa 1 phút"});
                    }
                    // -------
                    return res.status(400).json({code: 400, message: "Mật khẩu không chính xác"});
                }
                const data = {
                    email: user.email, name: user.name, username: username, birthday: user.birthday,
                    address: user.address, phone: user.phone, cmnd: user.cmnd
                };
                let message = '';
                let firstLogin = '';
                if(user.firstLogin){
                    //update firstLogin
                    await userModel.findOneAndUpdate({username}, {firstLogin: false});
                    message = "Đăng nhập lần đầu cần đổi mật khẩu";
                    firstLogin = true;
                }else{
                    message = "Đăng nhập thành công";
                    firstLogin = false;
                }
                // Login success
                delete req.session.locked;
                delete req.session.login_attempts;
                delete req.session.userlocked;
                await userModel.findOneAndUpdate({username}, {unusual: 0});
                const token = jwt.sign({name: data.name, email: data.email, username}, process.env.TOKEN_SECERT, {expiresIn: '10m'});
                res.cookie('auth-token', token, {httpOnly: true}); 
                return res.status(200).json({code: 200, firstLogin, message, data, token});
            }else{
                return res.status(400).json({code: 400, message: "Tài khoản không tồn tại"});
            }
        }catch(err){
            return res.status(400).json({code: 400, message: err});
        }    
    })
}

//Logout 
exports.logout = (req, res) => {
    res.clearCookie("auth-token");
    return res.status(200).json({code: 200, message: "Đã đăng xuất"});
}

//Reset Password
exports.forgotPassword = async (req, res) => {
    const form = formidable({ multiples: false });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({code: 400, message: err.message});
        }
        try {
            const {email} = fields;
            const user = await userModel.findOne({email});
            if(!user){
                return res.status(400).json({code: 400, message: "Không tìm thấy email này !"});
            }   
            const token = jwt.sign({_id: user._id}, process.env.RESET_PASSWORD_KEY, {expiresIn: '10m'});
            const userReset = await resetTokenModel.findOne({email});
            

            if(userReset){
                await resetTokenModel.findOneAndUpdate({email}, {token, createdAt: Date.now()});
            }else{
                const resetToken = new resetTokenModel({
                    email,token,
                })   
                await resetToken.save();
            }

            await helper.sendEmailResetPassword(email, token);
            return res.status(200).json({code: 200, message: "Link khôi phục mật khẩu đã được gửi vào email"});
        } catch (error) {
            return res.status(400).json({code: 400, message: "Gửi link khôi phục thất bại", error});
        }
    })
}
exports.resetPassword = async (req, res, next) => {
    const token = req.params.token;
    if(!token) return res.status(400).json({code: 400, message: "Vui lòng cung cấp token"}); 
    jwt.verify(token, process.env.RESET_PASSWORD_KEY, async(err, decoded)=>{
        if (err) {
            if(err.name == "TokenExpiredError") return res.status(400).json({code: 400, error: err.message});
            else return res.status(400).json({code: 400, error: "Invaild Reset Token"});
        }
        const check = await resetTokenModel.findOne({token});
        if(!check) return res.status(400).json({code: 400, message: "Link không còn tồn tại"}); 
        
        // Token Valid
        const form = formidable({ multiples: false });
        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(400).json({code: 400, message: err.message});
            }
            try {
                await middleware.chemaResetPassword.validateAsync(fields);
                const {newPass, confPass} = fields;
                const passwordHash = bcrypt.hashSync(newPass, 2);
                await userModel.findOneAndUpdate({email: check.email}, {password: passwordHash});
                await resetTokenModel.deleteOne({email: check.email, token})
                return res.status(200).json({code: 200, message: "Khôi phục mật khẩu thành công"});
            } catch (error) {
                return res.status(400).json({code: 400, message: error});
            }
        })
    });
}




