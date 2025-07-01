const express = require("express");

const wrapAsync= require("../utils/wrapAsync.js");



const passport = require('passport');

const router = express.Router();
const {  saveredirectUrl } = require("../middleware.js");
const usercon = require("../controllers/users.js");
 //Signup
 router.route("/signup")
.get((usercon.getsignup))
.post(wrapAsync(usercon.postsignup))


router.route("/login")
.get((usercon.login))
.post(saveredirectUrl,
    passport.authenticate('local', {
        failureRedirect: "/login",
        failureFlash: true
    }),
    wrapAsync(usercon.postlogin));

router.get("/logout",(usercon.logout))

module.exports = router;