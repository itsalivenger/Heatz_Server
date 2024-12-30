const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'products');

        // Check if the folder exists; if not, create it
        if (!fs.existsSync(uploadPath)) {
            console.log(`Creating directory: ${uploadPath}`);
            fs.mkdirSync(uploadPath, { recursive: true }); // Ensures that nested folders are created if needed
        }

        cb(null, uploadPath); // Save files to 'products' folder
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + path.extname(file.originalname);
        console.log(`Saving file to: ${path.join('products', uniqueName)}`);
        cb(null, uniqueName); // Save the file with the unique name
    }
});

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