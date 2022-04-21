const express = require("express");
const path = require("path");
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const logger = require("morgan");
const expressLayouts = require("express-ejs-layouts");

require("dotenv").config();

const app = express();

//MongooDb
const mongoose = require("mongoose");

//Require Router
const indexRouter = require("./app/routes/index.router");

// ------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser(process.env.SIGN_COOKIE));
app.use(cors());
app.use(expressLayouts);
app.set("layout", "layouts/main");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "app/views"));
// app.use(expressSession({secret: "secret"}));

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
  res.render("404", {error: " 404 Error"});
})

app.use((error, req, res, next) => {
  res.render("404", {error: " 500 Error"});
})

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((err) => {
    app.listen(process.env.PORT);
    console.log("Connect Success");
    console.log(`Server running at port ${process.env.PORT}`);
  })
  .catch((err) => {
    console.log("Connect Fail");
  });
