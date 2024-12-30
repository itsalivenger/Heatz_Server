const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'products/';

        // Check if the folder exists; if not, create it
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // Ensures that nested folders are created if needed
        }

        cb(null, uploadPath); // Save files to 'products' folder
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + path.extname(file.originalname); // Generate a unique filename
        const filePath = path.join('products', uniqueName);

        // Check if the file already exists
        if (fs.existsSync(filePath)) {
            return cb(new Error('File with the same name already exists'));
        }

        cb(null, uniqueName); // Save the file with the unique name
    }
});

// File validation
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true); // Accept file
        } else {
            cb(new Error('Only image files are allowed')); // Reject file with an error message
        }
    }
});

module.exports = upload;