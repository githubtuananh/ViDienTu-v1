const express = require("express");
const router = express.Router();

//Require controller
const userController = require("../controllers/user.controller");

//Require middleware
const validate = require('../middleware/validator');
const auth = require('../middleware/auth');


// ------------------------------------------------------------------------
//Change password
router.get("/changepassword", (req, res) => {
    const locals = { title: "Đổi mật khẩu" };
    res.render("auth/changePassword", locals);
});
router.post("/changePassword", userController.changePassword);

//home
router.get("/", (req, res) => {
    const locals = { title: "Trang chủ" };
    res.render("home", locals);
})
router.get("/test", userController.test)


module.exports = router;