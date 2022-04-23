const express = require("express");
const router = express.Router();

//Require controller
const accountController = require("../controllers/account.controller");

// ------------------------------------------------------------------------
//Register
router.get("/register", (req, res) => {
    const locals = { title: "Đăng ký" };
    res.render("auth/register", locals);
});
router.post("/register", accountController.register)

//Login 
router.get("/login", (req, res) => {
    const locals = { title: "Đăng nhập" };
    res.render("auth/login", locals);
});
router.post("/login", accountController.login);

//Logout
router.get("/logout", accountController.logout);

//Reset password
router.get("/forgot-password", (req, res) => {
    const locals = { title: "Khôi phục mật khẩu" };
    res.render("auth/forgotpassword", locals);
})
router.post("/forgot-password", accountController.forgotPassword);
router.post("/reset-password/:token", accountController.resetPassword);


module.exports = router;