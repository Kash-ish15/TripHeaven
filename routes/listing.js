require('dotenv').config(); // Make sure this is at the top

const apiKey = process.env.MAPTILER_API_KEY;
const express = require("express");
const router = express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const{isLoggedin} = require("../middleware.js");
const{ authorize, validateListing } = require("../middleware.js");
const listingcon = require("../controllers/listings.js");
const multer = require('multer');
const{storage} = require("../cloud_config.js");
const upload = multer({storage});

router
.route("/")
.get(wrapAsync(listingcon.index))
.post(
isLoggedin,
// validateListing,
upload.single('listing[image][url]'),
wrapAsync(listingcon.create));



// new route
router.get("/new",
    isLoggedin,(listingcon.new) 
    );

router
.route("/:id")
.get(wrapAsync(listingcon.show))
.put(isLoggedin,
    authorize,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingcon.update))
.delete(isLoggedin,
    authorize,
    wrapAsync(listingcon.delete));
 
//Edit Route
router.get(
    "/:id/edit",isLoggedin,authorize,
    wrapAsync(listingcon.edit));



 
module.exports = router;