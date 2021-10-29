const User = require('../models/User');
const firebaseController = require('../api/firebaseController');
const mailSender = require('../api/mail');


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
            console.log(response);
            if(response.success == false){
                throw response.error;
            }
            //user verification
            link="http://"+req.headers.host+"/verify?id="+response.userId;
            let subject = "Please confirm your Email account";
            let html = "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
            await mailSender(users.email,subject,html).then(()=>{
                console.log("Verify Mail Sent");
            })
            .catch((error)=>{
                errorMessage += error;
            })
        })
        .catch((error)=>{
            errorMessage += error;
        })

        await users.save()
        .then(response => {
            console.log("user registered.");
        })
        .catch(error => {
            errorMessage += error;
        })

        if(errorMessage == ''){
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
              res.end("<h1>Your account has been successfully verified.</h1> <script>setTimeout(function(){ window.close(); }, 3000);</script>"); 
            })
            .catch((error) => {
              res.end("<h1>Bad Request</h1>");
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
            res.end("<h1>Redirecting to forgot password page.</h1> <script>setTimeout(function(){ window.close(); }, 3000);</script>");      
        }
        else
        {
            res.end("<h1>Bad Request</h1>");
        }
    }

    static async updatePassword(req,res,next){
        let errorMessage = '';
        await firebaseController.updateUser(req.body.uid,{
            password:req.body.newpassword
        })
        .then(()=>{
            console.log("firebase updated");
        })
        .catch((error)=>{
            errorMessage += error;
        });

        await User.updateOne({email:req.body.email},{
            password:req.body.newpassword
        }).then(()=>{
            console.log("db updated");
        }).catch((error)=>{
            errorMessage += error;
        });

        if(errorMessage == ''){
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
        })
    }

    static async forgotPassword(req,res,next){
        let errorMessage = '';
        let uid = await firebaseController.getUserByEmail(req.params.email+"")
        .then((response)=>{
            return response.uid;
        })
        .catch((error)=>{
            errorMessage += error;
        });
        let link="http://"+req.headers.host+"/toupdatepassword?id="+uid;
        let subject = "Link for update password";
        let html = "Hello,<br> Please Click on the link to update your password.<br><a href="+link+">Click here to verify</a>"
        await mailSender(req.params.email,subject,html).then(()=>{
            console.log("Verify Mail Sent");
        })
        .catch((error)=>{
            errorMessage += error;
        })
        if(errorMessage == ''){
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