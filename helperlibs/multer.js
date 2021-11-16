const multer = require('multer');
const uuid = require('uuid').v4;
const path = 'userimages/';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path);
    },
    filename: (req, file, cb) => {
        const { originalname } = file;
        cb(null, `${uuid()}-${originalname}`);
    }
})
const upload = multer({ storage: storage });

module.exports = upload;