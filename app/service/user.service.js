const userModel = require("../models/user.model");
const blacklistUserModel = require("../models/blacklist.model");

exports.getUserById = async(username) => { 
    try {
        const user = await userModel.findOne({username});
        return user;
    } catch (error) {
        return false;
    }
}
