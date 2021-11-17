const logger = require('../log/logger');
const path = require("path");

var fileName = path.basename(__filename);

class matchController {

    // like
    static async like(req, res, next) {
        const db = req.app.get('db');
        const likesid = req.params.likesid;
        const likedid = req.params.likedid;
        let errorMessage = '';

        let isMatch = false;

        let text = `select * from likes where likesid = $1 and likedid = $2;`
        let values = [likedid, likesid];
        try {
            const result = await db.query(text, values)
            logger.info(likesid + " User like controlled.");
            console.log(result.rows.length);
            if (result.rows.length > 0) {
                isMatch = true;
            }

        } catch (error) {
            errorMessage += error;
            logger.error(fileName, error);
        }

        if (errorMessage == '') {
            try {
                if (isMatch) {
                    text = `INSERT INTO likes( likesid, likedid)
                    VALUES ($1, $2);`
                    values = [likesid, likedid];
                    let result = await db.query(text, values)

                    text = `INSERT INTO matches( uid, uidmatched)
                    VALUES ($1, $2);`
                    values = [likesid, likedid];
                    result = await db.query(text, values)

                    text = `INSERT INTO matches( uid, uidmatched)
                    VALUES ($2, $1);`
                    values = [likesid, likedid];
                    result = await db.query(text, values)

                    //send notification to matched user here

                    logger.info(likesid + " User successfully liked and there is match!");
                    res.json({
                        status: "success",
                        message: "User successfully liked and there is match!",
                        data: {
                            likedid: likedid
                        }
                    });
                } else {

                    text = `INSERT INTO likes( likesid, likedid)
                        VALUES ($1, $2);`
                    values = [likesid, likedid];
                    const result = await db.query(text, values)
                    logger.info(likesid + " User successfully liked.");
                    res.json({
                        status: "success",
                        message: "User successfully liked."
                    });
                }
            } catch (err) {
                res.json({
                    status: "error",
                    message: err
                });
            }
        }
    }

    // dislike
    static async dislike(req, res, next) {
        const db = req.app.get('db');
        const dislikesid = req.params.dislikesid;
        const dislikedid = req.params.dislikedid;

        const text = `INSERT INTO dislikes( dislikesid, dislikedid)
                        VALUES ($1, $2);`
        const values = [dislikesid, dislikedid];
        try {
            const result = await db.query(text, values)
            logger.info(dislikesid + " User successfully disliked.");
            res.json({
                status: "success",
                message: "User successfully disliked."
            });
        } catch (err) {
            console.log(err);
            res.json({
                status: "error",
                message: err
            });
        }
    }

}

module.exports = matchController;