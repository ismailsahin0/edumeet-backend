const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connection = async () => {
    mongoose.connect(process.env.DB_URL);
    console.log("Db Connected!");
}

module.exports = connection;