const express = require('express');
const matchController = require('../controllers/matchController');

const matchRouter = express.Router();

matchRouter.use('/dislike/:dislikesid/:dislikedid', matchController.dislike);
matchRouter.use('/like/:likesid/:likedid', matchController.like);

module.exports = matchRouter;