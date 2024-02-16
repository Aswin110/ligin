const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

exports.signup = [
  body("username", "username required").trim().isLength({ min: 3 }).escape(),
  body("email", "email required").trim().isEmail().escape(),
  body("password", "password minimum length 8")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    console.log("errors", errors);

    if (!errors.isEmpty()) {
      return res.render("index", {
        title: "Validation error",
        errors: errors.array(),
      });
    }

    try {
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res.render("index", {
          title: "sign up error",
          errors: [
            {
              msg: "User already exists. Please login or try another email to sign up.",
            },
          ],
        });
      } else {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        user = new User({
          username: req.body.username,
          email: req.body.email,
          password: hashedPassword,
        });

        await user.save();

        const token = jwt.sign({ user: user.toJSON() }, process.env.SECRET, {
          expiresIn: "1d",
        });

        res.render("logout", { title: "Signed in successfully" });
      }
    } catch (err) {
      return next(err);
    }
  }),
];

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
};

exports.login_page = (req, res) => {
  res.render("login");
};

exports.login = [
  body("email", "email required").trim().isEmail().escape(),
  body("password", "password minimum length 8")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("login", {
        title: "Validation error",
        errors: errors.array(),
      });
    }

    try {
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        const passwordMatch = await bcrypt.compare(
          req.body.password,
          user.password
        );

        if (passwordMatch) {
          const token = jwt.sign({ user: user.toJSON() }, process.env.SECRET, {
            expiresIn: "1d",
          });

          res.render("logout", { title: "Login successfully" });
        } else {
          return res.render("login", {
            title: "Log-In failed",
            errors: [{ msg: "Incorrect password" }],
          });
        }
      } else {
        return res.render("login", {
          title: "login error",
          errors: [{ msg: "This email is not signed up" }],
        });
      }
    } catch (err) {
      return next(err);
    }
  }),
];
