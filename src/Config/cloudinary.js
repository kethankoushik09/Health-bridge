const cloudinary = require("cloudinary").v2;


const connect_Cloudinary = async() =>{
    await cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secrte:process.env.CLOUD_SECRET_KEY
    })
}

module.exports = connect_Cloudinary;