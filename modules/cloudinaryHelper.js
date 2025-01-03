const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload images to Cloudinary
const uploadToCloudinary = (fileBuffer, folder = 'products') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url); // Return the URL of the uploaded image
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

module.exports = uploadToCloudinary;
