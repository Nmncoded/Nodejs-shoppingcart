var express = require('express');
const auth = require('../middlewares/auth');
const Admins = require('../models/Admins');
const Items = require('../models/Items');
const Users = require('../models/Users');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/signup", function (req, res, next) {
  const error = req.flash('signup-msg');
  console.log(req.session);
	res.render("signup", { error });
});


router.post("/signup", (req, res, next) => {
  console.log(req.body);
	if (req.body.isAdmin === "on") {
		console.log("hello admin");
    req.body.isAdmin = true
    // Admins.create(req.body, (err, content) => {
    //   if (err) return next(err);
    //   return res.redirect("/login");
    // });
	}
  // console.log("hello user");
  Users.create(req.body, (err, content) => {
    if (err) return next(err);
    return res.redirect("/login");
  });
});

router.get("/login", (req, res, next) => {
  const error = req.flash('error');
  res.render("userLogin", { error });
});

router.post("/login", function (req, res, next) {
  var { email, password } = req.body;
  if (!email || !password) {
    req.flash("error", "Email/password required");
    return res.redirect("/login");
  }
  Users.findOne({ email }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      req.flash("error", "User doesnt exist!! Please signup");
      return res.redirect("/login");
    }
    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);
      if (!result) {
        req.flash("error", "password is incorrect");
        return res.redirect("/login");
      }
      req.session.userId = user.id;
      return res.redirect("/dashboard");
      
    });
  });
});

router.get("/logout", (req, res, next) => {
  req.session.destroy();
  res.clearCookie();
  return res.redirect("/");
});

router.use(auth.isUserLogged);

router.get("/dashboard", (req, res, next) => {
	// var id = req.params.id;
  // console.log(req.user);
  Items.find({}, (err, items) => {
    if (err) return next(err);
    //     res.render("listItem", { data: content, session });
    //   });
    var msg = req.flash('empty-cart-msg')[0];
    // console.log(msg);
		return res.render("dashboardAdmin",{ items ,isAdmin : req.user.isAdmin, msg });
  })
  // Users.findById({ _id: id, isAdmin: true })
	// 	.populate("itemId")
	// 	.exec((err, content) => {
	// 		if (err) return next(err);
	// 		res.render("dashboardAdmin", { data: content });
	// 	});
});

module.exports = router;
