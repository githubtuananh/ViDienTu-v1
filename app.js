const express = require("express");
const path = require("path");
const port = 3000;
const session = require("express-session");
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

//Session Cookie
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 3,
      },
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

