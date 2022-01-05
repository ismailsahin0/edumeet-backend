const express = require('express');
const bodyParser = require('body-parser');
const userRouter = require('./services/userService')
const imageRouter = require('./services/imageService')
const matchRouter = require('./services/matchService')

const dotenv = require('dotenv');
const auth = require('./middleware/authentication')
const cors = require('cors');
const client = require('./db/connection')

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(auth);
app.set('db', client);
app.use('/userimages', express.static(__dirname + '/userimages'));

app.use('/usr', userRouter);
app.use('/img', imageRouter);
app.use('/mtc', matchRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Run on port ${port}`));