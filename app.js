const express = require("express");
const path = require("path");
const port = 3000;
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const logger = require("morgan");

require("dotenv").config();

const app = express();

//MongooDb
const db = require("./src/config/configDb");
db();

//Require Router
const indexRouter = require("./src/routes/index.router");

// ------------------------------------------------------------------------
//View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

//Cors
app.use(cors());

//Static File
app.use(express.static(path.join(__dirname, "public")));


//Handle Form
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser(process.env.SIGN_COOKIE));
// app.use(expressSession({secret: "secret"}));

//Session Cookie
app.use(
  expressSession({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(logger('tiny'));

//Handle Router
app.use("/", indexRouter);

//Handle Error
app.use((req, res) => {
  res.render("error/404", {error: " 404 Error"});
})
// app.use((error, req, res, next) => {
//   res.render("error/404", {error: " 500 Error"});
// })

//Run App
app.listen(port, () => {
    console.log("Run Success");
})

