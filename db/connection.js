const { Client } = require('pg')
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false }
});

client.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = client;

