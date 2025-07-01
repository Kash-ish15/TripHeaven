const Listing = require("../models/listing");
const axios = require('axios');
const mapToken = process.env.MAP_TOKEN;
//finding cordinates using geocoding in maptiler
async function geocodeLocation(query) {
  try {
    const response = await axios.get(`https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json`, {
      params: {
        key: mapToken
      }
    });

    if (response.data && response.data.features.length > 0) {
      return response.data.features[0].geometry.coordinates; // [lng, lat]
    } else {
      return null;
    }
  } catch (err) {
    console.error('Geocoding error:', err.message);
    return null;
  }
}

module.exports.index = async(req, res)=>{
    
 const allList = await Listing.find({});
  res.render("listings/index.ejs",{allList});
}
module.exports.new = (req, res) => {
    
    res.render("listings/form.ejs", { listing: null });  
    
}
module.exports.create = async (req, res) => {
  const address = req.body.listing.location; // or wherever you're storing the address

  const coordinates = await geocodeLocation(address); // [lng, lat]
    console.log(coordinates);

  const listing = new Listing({
    ...req.body.listing,
    geometry: {
      type: 'Point',
      coordinates: coordinates || [0, 0], // fallback
    },
  
    image: {
      url: req.file.path,
      filename: req.file.filename,
    },
    owner: req.user._id
  });

  await listing.save();
  req.flash('success', 'Listing created successfully!');
  res.redirect(`/listings/${listing._id}`);
};

module.exports.update = async(req,res)=>{
let{id} = req.params;
let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
if(typeof req.file !== "undefined"){
let url = req.file.path;
let filename = req.file.filename;
listing.image={url,filename};
await listing.save();
}
req.flash("secret", "listing updated");
res.redirect(`/listings/${id}`);

}
module.exports.show = async (req, res) => {
   let { id } = req.params;
       const listing = await Listing.findById(id).populate({path:"reviews",
         populate:
         {path:"author",

         },
        })
        .populate("owner");
       console.log(listing.owner.username);
        if(!listing){
            req.flash("error","Listing you requested for does not exist!");
            res.redirect("/listings");
        }
        res.render("listings/show", { listing });
    } 
module.exports.edit = async(req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
 req.flash("error", "listing you requested for does not  exist");
res.redirect("/listings");
}
let originalImageUrl = listing.image.url;
originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250")
    res.render("listings/edit.ejs",{ listing,originalImageUrl });
}
 
module.exports.delete = async(req,res)=>{
    let { id } = req.params;
   let deleted =  await Listing.findByIdAndDelete(id);
   console.log(deleted);
   req.flash("secret", "listing deleted");
   res.redirect("/listings");
}