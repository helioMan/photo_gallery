var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post")
const passport = require('passport');
const localStrategy = require("passport-local")
passport.use(new localStrategy(userModel.authenticate()))
const upload = require("./multer")

router.get('/', function (req, res) {
  res.render('index', {nav: false});
});

/* yahaan /register route banate hain */
/* is se page show ho raha hai */
router.get("/register", function (req, res) {
  res.render("register", {nav: false});
});

/* with this route we will se the profile page */
router.get("/profile", isLoggedIn, async (req, res, next) => {
  const user = await userModel
          .findOne({
          username: req.session.passport.user
          })
          .populate("posts")
          console.log(user)
  res.render("profile", {user, nav: true})
})


router.get("/show/posts", isLoggedIn, async (req, res, next) => {
  const user = await userModel
          .findOne({
          username: req.session.passport.user
          })
          .populate("posts")
          console.log(user)
  res.render("show", {user, nav: true})
})


router.get("/feed", isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({username: req.session.passport.user})
  const posts = await postModel.find().populate("user")

  res.render("feed", {user: user, posts: posts, nav: true}) // Pass user and posts separately
})



router.get("/add", isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  res.render("add", {user, nav: true})
})

router.post("/createpost", isLoggedIn, upload.single("postimage") , async (req, res, next) => {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })

  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename
  })

  user.posts.push(post._id)
  await user.save()
  res.redirect("/profile")
})



router.post("/fileupload", isLoggedIn, upload.single("image"), async (req, res) => {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })

  user.profileImage = req.file.filename
  await user.save()
  res.redirect("/profile")
})

/* page submit hone ke baad the route must go to register which is POST */
/* userModel: left side must have the same name as the userSchema, right side must have the same name as the name in the register form */
router.post("/register", function (req, res) {
  const data = new userModel({
    username: req.body.username,
    email: req.body.email,
    contact: req.body.contact,
    name: req.body.fullname
  })

  userModel.register(data, req.body.password)
    .then(() => {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile")
      })
    })
});

router.post("/login", passport.authenticate("local", {
  failureRedirect: "/",
  successRedirect: "/profile"
}), (req, res) => { })

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect("/")
}

module.exports = router;
