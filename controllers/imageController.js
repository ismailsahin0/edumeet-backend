const logger = require('../log/logger');
const path = require("path");
const compress = require('../helperlibs/compressimage');
const { deleteFile } = require('../helperlibs/fileoperations');

var fileName = path.basename(__filename);

class imageController {

    //single image upload
    static async uploadSingleImage(req, res, next) {
        console.log(req.body.id);
        const { uid, seq } = req.body;
        const db = req.app.get('db');
        compress(res.req.file.path);

        var path = res.req.file.path;
        console.log(path);
        var split = path.split(".");
        console.log(split);
        var newpath = split.slice(0, split.length - 1).join(".") + ".webp";
        console.log(newpath);

        const text = `INSERT INTO images(uid, path, seq)
        VALUES ($1,$2,$3)
        RETURNING uid;`
        const values = [uid, newpath, seq];
        try {
            const result = await db.query(text, values)
            logger.info(result.rows[0].uid + " users photo saved to db.");
            res.json({
                status: "success",
                message: "Users photo saved to database.",
                data: result.rows[0].uid
            })
        } catch (err) {
            res.json({
                status: "error",
                message: err
            })
            logger.error(fileName, err);
        }
    }

    //delete images of users
    static async deleteImagesOfUser(req, res, next) {
        const uid = req.params.uid;
        const db = req.app.get('db');
        let errorMessage = '';
        let text = `SELECT path FROM images WHERE uid = $1 ;`
        let values = [uid];

        try {
            const result = await db.query(text, values)
            for (const element of result.rows) {
                deleteFile(element.path);
                text = `DELETE FROM images WHERE path = $1;`;
                values = [element.path];
                try {
                    await db.query(text, values)
                } catch (err) {
                    errorMessage += err;
                    logger.error(fileName, err);
                }
            }


        } catch (err) {
            errorMessage += err;
            logger.error(fileName, err);
        }

        if (errorMessage == '') {
            logger.info(uid + " users photos deleted.");
            res.json({
                status: "success",
                message: "Users photos deleted."
            });
        }
        else {
            res.json({
                status: "error",
                message: errorMessage
            });
        }
    }

    // delete specific image of user
    static async deleteSpecificImageOfUser(req, res, next) {
        const uid = req.params.uid;
        const seq = parseInt(req.params.seq);
        const db = req.app.get('db');
        let errorMessage = '';
        let text = `SELECT path FROM images WHERE uid = $1 and seq = $2;`
        let values = [uid, seq];

        try {
            const result = await db.query(text, values)
            for (const element of result.rows) {
                deleteFile(element.path);
                text = `DELETE FROM images WHERE path = $1;`;
                values = [element.path];
                try {
                    await db.query(text, values)
                } catch (err) {
                    errorMessage += err;
                    logger.error(fileName, err);
                }
            }


        } catch (err) {
            errorMessage += err;
            logger.error(fileName, err);
        }

        if (errorMessage == '') {
            logger.info(uid + " users photos deleted.");
            res.json({
                status: "success",
                message: "Users photos deleted."
            });
        }
        else {
            res.json({
                status: "error",
                message: errorMessage
            });
        }
    }

    // delete specific image of user
    static async getImageOfUser(req, res, next) {
        const uid = req.params.uid;
        const db = req.app.get('db');
        let errorMessage = '';
        let text = `SELECT path FROM images WHERE uid = $1 ;`
        let values = [uid];
        let result;

        try {
            result = await db.query(text, values)
        } catch (err) {
            errorMessage += err;
            logger.error(fileName, err);
        }

        if (errorMessage == '') {
            logger.info(uid + " users photo sended.");
            res.json({
                status: "success",
                message: "Users photos sended.",
                data: result.rows[0].path
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

module.exports = imageController;