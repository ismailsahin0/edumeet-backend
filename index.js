const express = require('express');
const bodyParser = require('body-parser');
const testRouter =  require('./services/testService')
const userRouter =  require('./services/userService')
const dotenv = require('dotenv');
const auth = require('./middleware/authentication')
const cors = require('cors');
const connection = require('./db/connection')

dotenv.config();

const app = express();

connection();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());
app.use(auth);

app.use(testRouter);
app.use(userRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Run on port ${port}`));