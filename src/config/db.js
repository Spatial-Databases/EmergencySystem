const { Client } = require("pg");
require('dotenv').config({ override: true }); // Load environment variables from .env file

let client;
let debug = process.env.DEBUG;

if (debug){
  client = new Client({
    user: process.env.LOCAL_USER,
    password: process.env.LOCAL_PASSWORD,
    host: process.env.LOCAL_ENDPOINT,
    port: process.env.LOCAL_PORT,
    database: process.env.LOCAL_DATABASE="spatial_db"
    ,
  });
}else {
  client = new Client({
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.ENDPOINT,
    port: process.env.PORT,
    database: process.env.DATABASE,
    ssl: {
      rejectUnauthorized: false
    }
  });
}

client.connect(err => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected to the database');
  }
});

module.exports = client;