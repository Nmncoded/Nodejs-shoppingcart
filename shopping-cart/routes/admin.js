var express = require("express");
var router = express.Router();
var Users = require("../models/Users");
var Card = require("../models/Cart");
// const { get } = require("./users");
// const { render } = require("../app");
const Items = require("../models/Items");

/* GET home page. */
// router.get("/login", (req, res, next) => {
//   res.render("adminLogin", { error: req.flash("error") });
// });


// router.get("/signup", function (req, res, next) {
// 	res.render("signup", { error: req.flash("error") });
// });


// router.post("/signup", (req, res, next) => {
// 	const user = { ...req.body };
// 	if (req.body.isAdmin === "on") {
// 		console.log("hello admin");
// 		user.isAdmin = true;
// 	} else {
// 		user.isAdmin = false;
// 	}
// 	Users.create(user, (err, content) => {
// 		if (err) {
// 			if (err.name === "MongoError") {
// 				req.flash("error", "This email is already used");
// 				return res.redirect("/admin");
// 			}
// 			if (err.name === "ValidationError") {
// 				req.flash("error", err.message);
// 				return res.redirect("/admin");
// 			}
// 		}
// 		return res.redirect("/users/login");
// 	});
// });


// router.get("/:id/dasboardAdmin", (req, res, next) => {
// 	var id = req.params.id;
// 	Users.findById({ _id: id, isAdmin: true })
// 		.populate("itemId")
// 		.exec((err, content) => {
// 			if (err) return next(err);
// 			res.render("dashboardAdmin", { data: content });
// 		});
// });

router.get("/addItem", (req, res, next) => {
	return res.render( "addItem" );
	// var id = req.session.userId;
	// Users.findById(id, (err, content) => {
	// 	console.log(content);
	// 	if (content.isAdmin) {
	// 	} else {
	// 		res.redirect("/users/login");
	// 	}
	// });
});

router.post("/addItem", (req, res, next) => {
	req.body.adminId = req.user.id;
	Items.create(req.body, (err, content) => {
		if (err) return next(err);
		Users.findByIdAndUpdate(
			req.user.id,
			{ $push: { products : content._id } },
			{ new: true },
			(err, updateuser) => {
				if (err) return next(err);
				return res.redirect("/dashboard");
			}
		);
	});
});


module.exports = router;