const express = require('express');
const userController = require('../controllers/userController');
const upload = require('../helperlibs/multer');

const userRouter = express.Router();

userRouter.use('/register', userController.register);
userRouter.use('/verify', userController.verify);
userRouter.use('/universities', userController.getUniversities);
userRouter.use('/deleteuser/:id', userController.deleteUserById);

//image is not done
//images
userRouter.use('/image', upload.single('avatar'), userController.uploadSingleImage);


userRouter.use('/user/:email', userController.getUserByEmail);
userRouter.use('/password', userController.updatePassword);
userRouter.use('/forgotpassword/:email', userController.forgotPassword);
userRouter.use('/toupdatepassword', userController.toUpdatePassword);
userRouter.use('/', (req, res, next) => {
    res.send("hello world!");
});


module.exports = userRouter;