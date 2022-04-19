const express = require("express");
const router = express.Router();

//Require controller
const accountController = require("../controllers/account.controller");

//Require middleware
const validate = require('../middleware/validator');

//Require Other
// const multer = require('multer');
// const upload = multer({dest: "./public/image/cmnd/"});

// ------------------------------------------------------------------------
//Register
router.get("/register", (req, res) => {
    res.render("auth/register");
});
router.post("/register", accountController.register)


//Login 
router.get("/login", (req, res) => {
    res.render("auth/login");
});
router.post("/login", accountController.login);

//Verify
router.get("/verify", (req, res) => {
    res.redirect("/login");
});

//Test
router.get("/test", accountController.test)


module.exports = router;