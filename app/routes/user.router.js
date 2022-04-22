const express = require("express");
const router = express.Router();

//Require controller
const accountController = require("../controllers/account.controller");

//Require middleware
const validate = require('../middleware/validator');
const auth = require('../middleware/auth');


// ------------------------------------------------------------------------
//Logout
router.get("/logout", accountController.logout);

//Change password
router.get("/changepassword", (req, res) => {
    const locals = { title: "Đổi mật khẩu" };
    res.render("auth/changePassword", locals);
});
router.post("/changePassword", accountController.changePassword);

//home
router.get("/", (req, res) => {
    const locals = { title: "Trang chủ" };
    res.render("home", locals);
})
router.get("/test", accountController.test)


module.exports = router;