const User = require('../models/User');
const firebaseController = require('../api/firebaseController');
const mailSender = require('../api/mail');
const logger = require('../log/logger');
const path = require("path");

var fileName = path.basename(__filename);

class userController{
    //register
    static async register(req,res,next){
        let errorMessage = '';
        let users = new User({
            email: req.body.email,
            password: req.body.password,
            name: req.body.name,
            surname: req.body.surname,
            university: req.body.university,
            age: req.body.age,
            gender: req.body.gender
        });
        await firebaseController.createUser(users.email, users.password)
        .then(async (response)=>{
            if(response.success == false){
                throw response.error;
            }
            //user verification
            let link="http://"+req.headers.host+"/verify?id="+response.userId;
            let subject = "Please confirm your Email account";
            let html = "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
            await mailSender(users.email,subject,html).then(()=>{
                logger.info(response.userId+" user register mail sent.");
            })
            .catch((error)=>{
                errorMessage += error;
                logger.error(fileName, error);
            })
        })
        .catch((error)=>{
            errorMessage += error;
            logger.error(fileName, error);
        })

        await users.save()
        .then(response => {
            logger.info(users.email+" user registered.")
        })
        .catch(error => {
            errorMessage += error;
            logger.error(fileName, error);
        })

        if(errorMessage == ''){
            logger.info(users.email+" User successfully registered.");
            res.json({
                status:"success",
                message:"User successfully registered."
            });
        }
        else{
            res.json({
                status:"error",
                message: errorMessage
            });
        }
    }


    static async verify(req,res,next){
        if(req.query.id)
        {
            await firebaseController.updateUser(req.query.id,{
                emailVerified: true,
            })
            .then((userRecord) => {
              //will redirect to application here
              logger.info(req.query.id+" user verified.")
              res.end("<h1>Your account has been successfully verified.</h1> <script>setTimeout(function(){ window.close(); }, 3000);</script>"); 
            })
            .catch((error) => {
              res.end("<h1>Bad Request</h1>");
              logger.error(fileName, error);
            });         
        }
        else
        {
            res.end("<h1>Bad Request</h1>");
        }
    }

    static async toUpdatePassword(req,res,next){
        if(req.query.id)
        {
            logger.info(req.query.id+" user redirecting to forgot password page.");
            res.end("<h1>Redirecting to forgot password page.</h1> <script>setTimeout(function(){ window.location.replace('http://localhost:3000/update-password?id="+req.query.id+"'); }, 3000);</script>");      
        }
        else
        {
            res.end("<h1>Bad Request</h1>");
        }
    }

    static async updatePassword(req,res,next){
        let errorMessage = '';
        let data = await User.find({email:req.body.email});
        console.log(data);
        let oldPass = data[0].password;
        console.log(oldPass,req.body.password);
        if(oldPass !== req.body.password){
            res.json({
                status:"error",
                message: "Old password is incorrect"
            });
        }
        await firebaseController.updateUser(req.body.uid,{
            password:req.body.newpassword
        })
        .then(()=>{
            logger.info(req.body.uid+" user firebase password updated.")
        })
        .catch((error)=>{
            errorMessage += error;
            logger.error(fileName, error);
        });

        await User.updateOne({email:req.body.email},{
            password:req.body.newpassword
        }).then(()=>{
            logger.info(req.body.uid+" user db password updated.")
        }).catch((error)=>{
            errorMessage += error;
            logger.error(fileName, error);
        });

        if(errorMessage == ''){
            logger.info(req.body.email+" Password successfully updated.");
            res.json({
                status:"success",
                message:"Password successfully updated."
            });
        }
        else{
            res.json({
                status:"error",
                message: errorMessage
            });
        }

    }

    //list specific user
    static async getUserByEmail(req,res,next){
        User.find({email:req.params.email})
        .then(response =>{
            logger.info(req.params.email+" user fetched from db.");
            res.json({
                status:"success",
                message:"User is fetched from database.",
                data:response
            })
        })
        .catch(error => {
            res.json({
                status:"error",
                message: error
            })
            logger.error(fileName, error);
        })
    }

    static async forgotPassword(req,res,next){
        let errorMessage = '';
        let uid = await firebaseController.getUserByEmail(req.params.email+"")
        .then((response)=>{
            logger.info(req.params.email+" user uid fetched from db.");
            return response.uid;
        })
        .catch((error)=>{
            errorMessage += error;
            logger.error(fileName, error);
        });
        let link="http://"+req.headers.host+"/toupdatepassword?id="+uid;
        let subject = "Link for update password";
        let html = "Hello,<br> Please Click on the link to update your password.<br><a href="+link+">Click here to verify</a>"
        await mailSender(req.params.email,subject,html).then(()=>{
            logger.info(req.params.email+" user forgot password mail is sent.");
        })
        .catch((error)=>{
            errorMessage += error;
            logger.error(fileName, error);
        })
        if(errorMessage == ''){
            logger.info(req.params.email+" Forgot password email successfully sent.");
            res.json({
                status:"success",
                message:"Forgot password email successfully sent."
            });
        }
        else{
            res.json({
                status:"error",
                message: errorMessage
            });
        }
    }
}

module.exports = userController;