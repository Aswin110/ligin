const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

exports.login = [
  body("username", "username required").trim().isLength({ min: 3 }).escape(),
  body("email", "email required").trim().isEmail().escape(),
  body("password", "password minimum length 8")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("index", {
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
          const token = jwt.sign({ user: user.toJSON() }, "secret", {
            expiresIn: "1d",
          });

          res.render("login", { title: "Login successfully" });
        } else {
          return res.render("index", {
            title: "Log-In failed",
            errors: [{ msg: "Incorrect password" }],
          });
        }
      } else {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        user = new User({
          username: req.body.username,
          email: req.body.email,
          password: hashedPassword,
        });

        await user.save();

        const token = jwt.sign({ user: user.toJSON() }, "secret", {
          expiresIn: "1d",
        });

        res.render("login", { title: "Signed in successfully" });
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
