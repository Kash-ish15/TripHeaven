const Listing = require("../models/listing");
const axios = require('axios');
const mapToken = process.env.MAP_TOKEN;
//finding cordinates using geocoding in maptiler
async function geocodeLocation(query) {
  try {
    console.log('Geocoding query:', query);
    const response = await axios.get(`https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${mapToken}`);

    if (response.data && response.data.features && response.data.features.length > 0) {
      const coordinates = response.data.features[0].geometry.coordinates;
      console.log('Geocoding successful:', coordinates);
      return coordinates; // [lng, lat]
    } else {
      console.log('No geocoding results found for:', query);
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
  const {address} = req.body.listing.location; 
  console.log('Address for geocoding:', address);

  const coordinates = await geocodeLocation(address); // [lng, lat]
  console.log('Geocoded coordinates:', coordinates);

  // Check if geocoding was successful
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
    req.flash('error', 'Could not find coordinates for the provided address. Please provide a more specific address.');
    return res.redirect('/listings/new');
  }

  const listing = new Listing({
    ...req.body.listing,
    geometry: {
      type: 'Point',
      coordinates: coordinates,
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
const {address} = req.body.listing.location;

// Geocode the new address if provided
let coordinates = null;
if (address) {
  coordinates = await geocodeLocation(address);
  console.log('Updated coordinates:', coordinates);
  
  // Check if geocoding was successful
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
    req.flash('error', 'Could not find coordinates for the provided address. Please provide a more specific address.');
    return res.redirect(`/listings/${id}/edit`);
  }
}

let updateData = {...req.body.listing};

// Update geometry if new coordinates are available
if (coordinates) {
  updateData.geometry = {
    type: 'Point',
    coordinates: coordinates
  };
}

let listing = await Listing.findByIdAndUpdate(id, updateData);

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

// Utility function to fix existing listings with empty coordinates
module.exports.fixCoordinates = async(req,res)=>{
    const listings = await Listing.find({});
    let fixedCount = 0;
    
    for(let listing of listings) {
        // Check if coordinates are empty or invalid
        if (!listing.geometry || 
            !listing.geometry.coordinates || 
            listing.geometry.coordinates.length === 0 ||
            (listing.geometry.coordinates[0] === 0 && listing.geometry.coordinates[1] === 0)) {
            
            // Try to geocode using location and country
            const address = `${listing.location}, ${listing.country}`;
            const coordinates = await geocodeLocation(address);
            
            if (coordinates && Array.isArray(coordinates) && coordinates.length >= 2) {
                listing.geometry = {
                    type: 'Point',
                    coordinates: coordinates
                };
                await listing.save();
                fixedCount++;
                console.log(`Fixed coordinates for listing: ${listing.title}`);
            }
        }
    }
    
    req.flash('success', `Fixed coordinates for ${fixedCount} listings.`);
    res.redirect('/listings');
}
 
module.exports.delete = async(req,res)=>{
    let { id } = req.params;
   let deleted =  await Listing.findByIdAndDelete(id);
   console.log(deleted);
   req.flash("secret", "listing deleted");
   res.redirect("/listings");
}