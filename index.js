const express = require('express');
const bodyParser = require('body-parser');
const userRouter =  require('./services/userService')

const dotenv = require('dotenv');
const auth = require('./middleware/authentication')
const cors = require('cors');
const client = require('./db/connection')

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());
app.use(auth);
app.set('db',client);

app.use(userRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Run on port ${port}`));