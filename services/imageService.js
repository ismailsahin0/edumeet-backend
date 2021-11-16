const express = require('express');
const imageController = require('../controllers/imageController');
const upload = require('../helperlibs/multer');

const imageRouter = express.Router();

imageRouter.use('/image', upload.single('avatar'), imageController.uploadSingleImage);
imageRouter.use('/deleteimage/:uid', imageController.deleteImagesOfUser);


module.exports = imageRouter;