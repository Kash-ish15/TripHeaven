const Listing = require("../models/listing.js");

const Review = require("../models/review.js");

module.exports.post = async(req,res)=>{
    const listingId = req.baseUrl.split("/")[2];
    
    let listing = await Listing.findById(listingId);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);
    listing.reviews.push(newReview);
   
    await newReview.save();
    await listing.save();
    req.flash("secret","New Review Created");
    res.redirect(`/listings/${listing._id}`)

 }
 module.exports.delete = async(req,res)=>{
      let { id, reviewId } = req.params;
       await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId }});
      await Review.findByIdAndDelete(reviewId);
      req.flash("success","Review Deleted!");
      res.redirect(`/listings/${id}`);
  
  }