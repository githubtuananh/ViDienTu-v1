const express = require("express");
const router = express.Router();

//Require controller
const accountController = require("../controllers/account.controller");

//Require middleware
const validate = require('../middleware/validator');
const auth = require('../middleware/auth');


// ------------------------------------------------------------------------
//Register
router.get("/register", (req, res) => {
    const locals = { title: "Đăng ký" };
    res.render("auth/register", locals);
});
router.post("/register", accountController.register)

//Login 
router.get("/login", (req, res) => {
    const locals = { title: "Đăng nhậ123p" };
    res.render("auth/login", locals);
});
router.post("/login", accountController.login);

//Logout
router.get("/logout", accountController.logout);

//Change password
router.get("/changepassword", (req, res) => {
    const locals = { title: "Đổi mật khẩu" };
    res.render("auth/changePassword", locals);
});
router.post("/changePassword", auth.requireAuth, accountController.changePassword);


//Test
router.get("/", auth.requireAuth, (req, res) => {
    const locals = { title: "Đổi mật khẩu" };
    res.render("index", locals);
})
router.get("/test", accountController.test)


module.exports = router;