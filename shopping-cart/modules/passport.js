var passport = require('passport');
const User = require('../models/User');
var GitHubStrategy = require('passport-github').Strategy;
var googleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GitHubStrategy({
	clientID: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	callbackURL: "/auth/github/callback"
},
	(accessToken, refreshToken, profile, cb) => {
		console.log(profile,"profile");
		// cb(null,true)
		// User.findOrCreate({ githubId: profile.id }, function (err, user) {
		//   return cb(err, user);
		// });
		var profileData = {
			name: profile.displayName,
			username: profile.username,
			email: profile._json.email || "nmn.office@yahoo.com" ,
			// photo: profile._json.avatar_url,
		}

		User.findOne({ email: profileData.email }, (err, existedUser) => {
			if (err) return cb(err);
			console.log(existedUser,profileData,"exiestedUser")
			if (!existedUser) {
				User.create(profileData, (err, addedUser) => {
					if (err) return cb(err);
					return cb(null, addedUser)
				})
			} else {
				return cb(null, existedUser);
			}
		})
	}
));


passport.use(new googleStrategy({
	clientID: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL:"/login/oauth2/google"
},
	(accessToken, refreshToken, profile, cb) => {
		console.log(profile,"profile");
		// cb(null,"nmn");
		var profileData = {
			name: profile.displayName,
			username: profile.displayName,
			email: profile.emails[0].value,
			// photo: profile._json.picture,
		}

		User.findOne({ email: profileData.email }, (err, existedUser) => {
			if (err) return cb(err);
			// console.log(existedUser);
			if (!existedUser) {
			// console.log(existedUser);	
				User.create(profileData, (err, addedUser) => {
					if (err) return cb(err);
					return cb(null, addedUser)
				})
			} else {
				// console.log(existedUser,"existedUser");
				return cb(null, existedUser);
			}
		})
	}
));

passport.serializeUser((user,cb) => {
	// console.log(value,"inside serialize");
	return cb(null,user.id);
});

passport.deserializeUser((id,cb) => {
	// console.log(id,"id");
	User.findById(id,(err, result) => {
	// console.log(result,"result");
		return cb(err,result);
	})
})