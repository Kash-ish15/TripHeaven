const User = require("../models/user.js");

module.exports.getsignup = async(req,res)=>{
    res.render("users/signup.ejs");
}

module.exports.postsignup = async(req,res)=>{
    try{
    let {username, email, password} = req.body;
   const newUser =  new User({email,username});
 const registereduser =   await User.register(newUser,password);
 console.log(registereduser);
 req.login(registereduser,(err)=>{
    if(err){
      return next(err);
    }
    else{
 req.flash("secret","Welcome to TripHeaven");
 res.redirect("/listings");
    }
 })}

 catch(e){
    req.flash("error",e.message);
    res.redirect("/signup");

 }
}
module.exports.login = (req,res)=>{
    res.render("users/login");
}
module.exports.postlogin = async(req, res)=> {
     console.log(res.locals.redirectUrl);
         return res.redirect(res.locals.redirectUrl || "/listings") ;
        }
module.exports.logout = (req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("secret", "You are logged out!");
        res.redirect("/listings");
    }
)
}