//Require models
const userModel = require("../models/user.model");
const blacklistUserModel = require("../models/blacklist.model");
const lockUserUserModel = require("../models/lockUser.model");



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
                    const result = await helper.sendEmail(email, username, password);

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

        //Check Fields
        try{
            const result = await middleware.chemaLogin.validateAsync(fields);
        }catch(err){
            return res.status(400).json({code: 400, message: err});
        }

        const {username, password} = fields;
        //Check User And Password
        try{
            const user = await userModel.findOne({username});
            if(user){ //Check User Exists
                //Check Password
                const passwordCorrect = user.password;
                const result = bcrypt.compareSync(password, passwordCorrect);
                if(!result) return res.status(400).json({code: 400, message: "Sai tài khoản hoặc mật khẩu"});

                const data = {
                    email: user.email,
                    name: user.name,
                    username: username,
                    birthday: user.birthday,
                    address: user.address,
                    phone: user.phone,
                    cmnd: user.cmnd
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
                const token = jwt.sign({name: data.name, email: data.email, username}, process.env.TOKEN_SECERT, {expiresIn: '5m'});
                res.cookie('auth-token', token, {httpOnly: true}); 
                return res.status(200).json({code: 200, firstLogin, message, data, token});
            }else{
                return res.status(400).json({code: 400, message: "Sai tài khoản hoặc mật khẩu"});
            }
        }catch (err){
            return res.status(500).json({code: 500, message: "Lỗi truy xuất DB", error: err});
        }       
    })
}

//Change Password
exports.changePassword = async (req, res) => {

}



//Logout 
exports.logout = (req, res) => {
    res.clearCookie("auth-token");
    return res.status(200).json({code: 200, message: "Đã đăng xuất"});
}

    
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


