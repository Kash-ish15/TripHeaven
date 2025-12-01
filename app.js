// import mongoose from "mongoose";
// import dotenv from "dotenv";
require('dotenv').config()
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore= require("connect-mongo");
const methodOverride = require('method-override');
const flash = require("connect-flash");
const path = require("path");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");



//Initialize monogoooo
 const dbURL =  "mongodb://127.0.0.1:27017/tripheaven";
//  const dbURL = process.env.ATLAS_URL;

               
let port = 8080;
 async function main(){
 await mongoose.connect(dbURL);
}
main().then(()=>{
    console.log("db connected")
})
.catch((err)=>{
    console.log(err);
})
//////////

mongoose.set('strictPopulate', false);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl : dbURL,
    crypto:{
           secret: process.env.SECRET,
    },
        
        touchAfter:24*60*60,

})
 store.on("error",() =>{
    console.log("EROR IN MONGO SESSION STORE", err);
 })
const sessionOption = {
    store, 
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000, 
        httpOnly:true
    },
};
app.use(session(sessionOption));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
res.locals.secret = req.flash("secret");
res.locals.error = req.flash("error");
res.locals.CurrUser = req.user;
next();
})

app.use("/listings",listings);

app.use("/listings/:id/reviews",reviews);

app.use("/",userRouter);




app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


app.use((err, req, res, next)=>{
    let{statusCode = 500, message = "Something went wrong!"} = err;
    res.status(statusCode).render("error",{message});
});
app.listen(port, ()=>{
    console.log(`app is listening on ${port}`);
})
