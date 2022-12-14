if (process.env.NODE_ENV !== 'production') { 
  require("dotenv").config({path:'./.env'});
}
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
var mongoose = require("mongoose");
const uri = process.env.MONGODB_URI;
// console.log(uri);
var session = require("express-session");
const cfg = require('./config.js');
var MongoStore = require("connect-mongo");
var flash = require("connect-flash");


var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var adminRouter = require("./routes/admin");
var itemsRouter = require("./routes/item");
const auth = require('./middlewares/auth');

mongoose.connect(
  (  uri || "mongodb://127.0.0.1/shoppingCart" ) ,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    console.log(err ? err : "Connected to database");
  }
);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: cfg.secured_key,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: "mongodb://127.0.0.1/shoppingCart"
    }),
    // store : new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

app.use(flash());

app.use(auth.userInfo);

app.use("/", indexRouter);
app.use(auth.isUserLogged);
app.use("/users", usersRouter);
app.use("/admin", adminRouter);
app.use("/items", itemsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
