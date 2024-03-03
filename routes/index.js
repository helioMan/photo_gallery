var express = require("express");
const mongoose = require("mongoose");
const userModel = require("./users");
const passport = require("passport");
var router = express.Router();
const localStrategy = require('passport-local')
passport.use(new localStrategy(userModel.authenticate()))

router.get("/", function (req, res, next) {
  res.render("index");
});


router.get("/register", (req, res) => {
  res.render("register");
});


router.get("/profile", isLoggedIn ,(req, res) => {
  res.render("profile");
});


router.post("/register", (req, res) => {
  const data = new userModel({
    username: req.body.username,
    email: req.body.email,
    contact: req.body.contact
  });

  userModel.register(data, req.body.password)
    .then(() => {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/profile")
      })
    })
});


router.post("/login", passport.authenticate("local", {
  failureRedirect: "/",
  successRedirect: "/profile"
}) ,(req, res) => {});


router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if(err) {
      return next(err)
    }
    res.redirect('/')
  })
})


function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect("/")
}

module.exports = router;
