const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync= require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");

const Review = require("../models/review.js");
const {isLoggedin, ReviewAuthorize, validateReview} = require("../middleware.js")
const reviewcon = require("../controllers/review.js");


//POST REVIEW 
router.post("/", 
    isLoggedin,

    validateReview,
    wrapAsync(reviewcon.post))
 
 //Delete review
router.delete("/:reviewId", ReviewAuthorize,
     wrapAsync(reviewcon.delete))
  
module.exports = router;