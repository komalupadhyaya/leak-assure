const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const multerUpload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadToCloudinary = (req, res, next) => {
    const files = req.files || (req.file ? [req.file] : []);
    if (files.length === 0) {
        return next();
    }

    const uploadPromises = files.map(file => {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'leak-assure-claims',
                    allowed_formats: ['jpg', 'png', 'jpeg'],
                },
                (error, result) => {
                    if (error) return reject(error);
                    // Add the secure_url to the file object as 'path' 
                    // to keep it compatible with existing controllers
                    file.path = result.secure_url;
                    resolve(result);
                }
            );
            stream.end(file.buffer);
        });
    });

    Promise.all(uploadPromises)
        .then(() => next())
        .catch(err => {
            console.error('Cloudinary upload error:', err);
            res.status(500).json({ error: 'Failed to upload images to Cloudinary' });
        });
};

module.exports = {
    array: (fieldname, maxCount) => [
        multerUpload.array(fieldname, maxCount),
        uploadToCloudinary
    ],
    single: (fieldname) => [
        multerUpload.single(fieldname),
        uploadToCloudinary
    ]
};
