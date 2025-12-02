const Listing = require("./models/listing");
const Review = require("./models/review");
const {listingSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const {reviewSchema} = require("./schema.js");
module.exports.isLoggedin = (req,res,next)=>{
 if(!req.isAuthenticated()){
       //redirect Url
        req.session.redirectUrl = req.originalUrl;
        
        req.flash("error","You must login first");
        return res.redirect("/login");
       
    }

    next();
}

module.exports.saveredirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }  
    next();
};
module.exports.authorize= async(req,res,next)=>{
     let { id } = req.params;
      let listing = await Listing.findById(id);
     
      if(!listing){
        req.flash("error","Listing not found");
        return res.redirect("/listings");
      }
      
      if(!listing.owner || !listing.owner._id.equals(req.user._id)){
        req.flash("error","You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
      }
      next();
}
module.exports.validateListing = (req, res, next)=>{
    let { error } = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) =>
            el.message).join(",");
            throw new ExpressError(400, errMsg);
        } else{
            next();
        }
}
module.exports.ReviewAuthorize= async(req,res,next)=>{
     let { id, reviewId } = req.params;
      let review = await Review.findById(reviewId);
      console.log(review);
     
      if(!review.author.equals(res.locals.CurrUser._id)){
        req.flash("error","You are not the author of this review");
        return res.redirect(`/listings/${id}`);
      }
      next();
}
module.exports.validateReview = (req, res, next)=>{
    let { error } = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) =>
            el.message).join(",");
            throw new ExpressError(400, errMsg);
        } else{
           next();
        }
}