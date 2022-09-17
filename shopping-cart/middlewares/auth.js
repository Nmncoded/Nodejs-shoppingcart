const Users = require("../models/Users");

// middlewares/auth.js
module.exports = {
    isUserLogged: (req, res, next) => {
        if (req.session && req.session.userId) {
            return next();
        } else {
            req.flash("error", "you need to login first !!!");
            return res.redirect("/login");
        }
    },
    userInfo: (req, res, next) => {
        var userId = req.session && req.session.userId;
        if (userId) {
            Users.findById(userId, (err, user) => {
                if (err) return next(err);
                req.user = user;
                res.locals.user = user;
                return next();
            })
        } else {
            req.user = null;
            res.locals.user = null;
            return next();
        }
    }
};