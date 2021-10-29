const express = require('express');
const testController =  require('../controllers/testController')

const testRouter = express.Router();

testRouter.use('/test',testController.testMethod);

module.exports = testRouter;