const express = require('express');
const cors = require('cors');
const app = express();
const pool = require("./db");
require("dotenv").config();


//middleware
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;

//routes
app.use("/data", require("./routes/spatialDB"));

app.listen(port, () => {
    console.log(`Server running on port ${port}`
    );
});