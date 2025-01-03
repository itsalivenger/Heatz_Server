const multer = require('multer');
const path = require('path')

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

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
