const express = require('express');
const userController =  require('../controllers/userController')

const userRouter = express.Router();

userRouter.use('/register',userController.register);
userRouter.use('/verify',userController.verify);
userRouter.use('/user/:email',userController.getUserByEmail);
userRouter.use('/password',userController.updatePassword);
userRouter.use('/forgotpassword/:email',userController.forgotPassword);
userRouter.use('/toupdatepassword',userController.toUpdatePassword);


module.exports = userRouter;