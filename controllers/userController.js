const firebaseController = require('../api/firebaseController');
const mailSender = require('../api/mail');
const logger = require('../log/logger');
const path = require("path");
const { deleteFile } = require('../helperlibs/fileoperations');

var fileName = path.basename(__filename);

class userController {
    //register
    static async register(req, res, next) {
        const db = req.app.get('db');
        let errorMessage = '';
        let users = {
            id: '',
            email: req.body.email,
            password: req.body.password,
            name: req.body.name,
            surname: req.body.surname
        };
        await firebaseController.createUser(users.email, users.password)
            .then(async (response) => {
                if (response.success == false) {
                    throw response.error;
                }
                users.id = response.userId;
                //user verification
                let link = "http://" + req.headers.host + "/usr/verify?id=" + response.userId;
                let subject = "Please confirm your Email account";
                let html = "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
                // await mailSender(users.email, subject, html).then(() => {
                //     logger.info(response.userId + " user register mail sent.");
                // })
                //     .catch(async (error) => {
                //         errorMessage += error;
                //         await firebaseController.deleteUser(users.id)
                //             .then(() => {
                //                 logger.info(users.email + " User deleted from firebase for rollback.");
                //             }).catch((err) => {
                //                 logger.error(fileName, error);
                //             });
                //         logger.error(fileName, error);
                //     })
                const text = `INSERT INTO users(id, email, name, surname, password)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id;`
                const values = [users.id, users.email, users.name, users.surname, users.password];
                if (errorMessage === '') {
                    try {
                        const res = await db.query(text, values)
                        logger.info(users.email + " user registered.");
                    } catch (err) {
                        errorMessage += err;
                        await firebaseController.deleteUser(users.id)
                            .then(() => {
                                logger.info(users.email + " User deleted from firebase for rollback.");
                            }).catch((err) => {
                                logger.error(fileName, err);
                            });
                        logger.error(fileName, err);
                    }
                }
            })
            .catch((error) => {
                errorMessage += error;
                logger.error(fileName, error);
            })



        if (errorMessage == '') {
            logger.info(users.email + " User successfully registered.");
            res.json({
                status: "success",
                message: "User successfully registered."
            });
        }
        else {
            res.json({
                status: "error",
                message: errorMessage
            });
        }
    }

    //update user
    static async updateUser(req, res, next) {
        const db = req.app.get('db');

        let users = {
            id: req.body.id,
            name: req.body.name,
            surname: req.body.surname,
            age: req.body.age,
            gender: req.body.gender,
            bio: req.body.bio
        };

        const text = `UPDATE users SET
                        name = $1,
                        surname = $2,
                        age = $3,
                        gender = $4,
                        bio = $5
                    WHERE id = $6
                    RETURNING id;`
        const values = [users.name, users.surname, users.age, users.gender, users.bio, users.id];
        try {
            const result = await db.query(text, values)
            logger.info(users.id + " User successfully updated.");
            res.json({
                status: "success",
                message: "User successfully updated."
            });
        } catch (err) {
            console.log(err);
            res.json({
                status: "error",
                message: err
            });
        }

    }

    //verify
    static async verify(req, res, next) {
        const db = req.app.get('db');
        if (req.query.id) {
            await firebaseController.updateUser(req.query.id, {
                emailVerified: true,
            })
                .then(async (userRecord) => {
                    //will redirect to application here
                    logger.info(req.query.id + " user verified on firebase.");
                    const text = `update users set verified = true where id = $1;`
                    const values = [req.query.id];
                    try {
                        const res = await db.query(text, values)
                        logger.info(req.query.id + " user verified on db.");
                    } catch (err) {
                        await firebaseController.updateUser(req.query.id, {
                            emailVerified: false,
                        })
                            .then(() => {
                                logger.info(req.query.id + " User not verified from firebase for rollback.");
                            }).catch((err) => {
                                logger.error(fileName, err);
                            });
                        logger.error(fileName, err);
                    }
                    res.end("<h1>Your account has been successfully verified.</h1> <script>setTimeout(function(){ window.close(); }, 3000);</script>");
                })
                .catch((error) => {
                    res.end("<h1>Bad Request</h1>");
                    logger.error(fileName, error);
                });

        }
        else {
            res.end("<h1>Bad Request</h1>");
        }
    }

    //getuniversities
    static async getUniversities(req, res, next) {
        const db = req.app.get('db');
        const text = `SELECT * FROM universities;`
        try {
            const result = await db.query(text)
            logger.info("universities sended.");
            res.json({
                status: "success",
                message: "Users sended.",
                data: result.rows
            });
        } catch (err) {
            logger.error(fileName, err);
            res.json({
                status: "error",
                message: err
            });
        }
    }

    //delete user
    static async deleteUserById(req, res, next) {
        const db = req.app.get('db');
        let errorMessage = '';
        if (req.params.id) {
            await firebaseController.deleteUser(req.params.id)
                .then(async (userRecord) => {
                    //will redirect to application here
                    logger.info(req.params.id + " user deleted from firebase.");
                    const text = ` delete from users where id = $1;`
                    const values = [req.params.id];
                    try {
                        const res = await db.query(text, values)
                        logger.info(req.query.id + " user deleted from db.");
                    } catch (err) {
                        errorMessage += err;
                        logger.error(fileName, err);
                    }

                })
                .catch((error) => {
                    errorMessage += error;
                    logger.error(fileName, error);
                });

        }
        else {
            errorMessage += 'There is no id sent.'
        }

        if (errorMessage == '') {
            logger.info(req.params.email + " user deleted.");
            res.json({
                status: "success",
                message: "User deleted."
            });
        }
        else {
            res.json({
                status: "error",
                message: errorMessage
            });
        }
    }

    //list specific user
    static async getUserByEmail(req, res, next) {
        const db = req.app.get('db');

        const text = `select * from users where email = $1;`
        const values = [req.params.email];
        try {
            const result = await db.query(text, values)
            logger.info(req.params.email + " user fetched from db.");
            res.json({
                status: "success",
                message: "User is fetched from database.",
                data: result.rows
            })
        } catch (err) {
            res.json({
                status: "error",
                message: err
            })
            logger.error(fileName, err);
        }

    }

    static async toUpdatePassword(req, res, next) {
        if (req.query.id) {
            logger.info(req.query.id + " user redirecting to forgot password page.");
            res.end("<h1>Redirecting to forgot password page.</h1> <script>setTimeout(function(){ window.location.replace('http://localhost:3000/update-password?id=" + req.query.id + "'); }, 3000);</script>");
        }
        else {
            res.end("<h1>Bad Request</h1>");
        }
    }

    static async updatePassword(req, res, next) {
        const db = req.app.get('db');
        let errorMessage = '';
        let data = await User.find({ email: req.body.email });
        console.log(data);
        let oldPass = data[0].password;
        console.log(oldPass, req.body.password);
        if (oldPass !== req.body.password) {
            res.json({
                status: "error",
                message: "Old password is incorrect"
            });
        }
        await firebaseController.updateUser(req.body.uid, {
            password: req.body.newpassword
        })
            .then(() => {
                logger.info(req.body.uid + " user firebase password updated.")
            })
            .catch((error) => {
                errorMessage += error;
                logger.error(fileName, error);
            });


        const text = `update users set password = $2 where id = $1;`
        const values = [req.body.uid, req.body.newpassword];
        if (errorMessage === '') {
            try {
                const res = await db.query(text, values)
                logger.info(req.body.uid + " user password updated.");
            } catch (err) {
                errorMessage += err;
                await firebaseController.updateUser(req.body.uid, {
                    password: req.body.password
                })
                    .then(() => {
                        logger.info(req.body.uid + " User password is updated from firebase for rollback.");
                    }).catch((err) => {
                        logger.error(fileName, err);
                    });
                logger.error(fileName, err);
            }
        }

        if (errorMessage == '') {
            logger.info(req.body.email + " Password successfully updated.");
            res.json({
                status: "success",
                message: "Password successfully updated."
            });
        }
        else {
            res.json({
                status: "error",
                message: errorMessage
            });
        }

    }

    static async forgotPassword(req, res, next) {
        let errorMessage = '';
        let uid = await firebaseController.getUserByEmail(req.params.email + "")
            .then((response) => {
                logger.info(req.params.email + " user uid fetched from db.");
                return response.uid;
            })
            .catch((error) => {
                errorMessage += error;
                logger.error(fileName, error);
            });
        let link = "http://" + req.headers.host + "/toupdatepassword?id=" + uid;
        let subject = "Link for update password";
        let html = "Hello,<br> Please Click on the link to update your password.<br><a href=" + link + ">Click here to verify</a>"
        await mailSender(req.params.email, subject, html).then(() => {
            logger.info(req.params.email + " user forgot password mail is sent.");
        })
            .catch((error) => {
                errorMessage += error;
                logger.error(fileName, error);
            })
        if (errorMessage == '') {
            logger.info(req.params.email + " Forgot password email successfully sent.");
            res.json({
                status: "success",
                message: "Forgot password email successfully sent."
            });
        }
        else {
            res.json({
                status: "error",
                message: errorMessage
            });
        }
    }


}

module.exports = userController;