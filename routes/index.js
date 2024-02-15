var express = require("express");
var router = express.Router();
const controller = require("../controller/auth");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// router.get("/login", controller.login);

router.post("/login", controller.login);

router.post("/logout", controller.logout);

module.exports = router;
