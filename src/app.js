const express = require('express');
const path = require('path');
const client = require("./config/db");
const { join } = require("path");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
require('dotenv').config(); // Load environment variables from .env file
// const logger = require('morgan');
// const cookieParser = require('cookie-parser');
// const https = require('https');

//middleware
const app = express();
app.use(express.json());

app.use(cors());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  });

app.use(limiter);


const PORT = 5000;
const router = require('./routes/spatialDB');
//routes
app.use("/api", router);

app.listen(PORT, () => {
    console.log(`Server running on port http://${process.env.EC2_ENDPOINT}:${PORT}`
    );
});