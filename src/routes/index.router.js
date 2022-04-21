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
    res.render("auth/register");
});
router.post("/register", accountController.register)

//Login 
router.get("/login", (req, res) => {
    res.render("auth/login");
});
router.post("/login", accountController.login);

//Logout
router.get("/logout", accountController.logout);




//Test
router.get("/", auth.requireAuth, (req, res) => {
    res.render("index");
})
router.get("/test", accountController.test)


module.exports = router;