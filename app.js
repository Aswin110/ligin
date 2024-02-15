var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const compression = require("compression");

const passport = require("passport");
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const User = require("./models/user");
const dotenv = require("dotenv");

dotenv.config();
var app = express();

mongoose.set("strictQuery", false);

const mongoDB = process.env.MONGODB_URI;
console.log(mongoDB);
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
  console.log("connected to mongodb");
}

passport.use(
  new JWTStrategy(
    {
      secretOrKey: "secret",
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      issuer: process.env.SERVER_URL,
      audience: process.env.CLIENT_URL,
    },
    async (jwt_payload, done) => {
      console.log("jwt_payload", jwt_payload);
      User.findOne({ username: jwt_payload.username }, function (err, user) {
        console.log("user", user);
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    }
  )
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(compression());

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
