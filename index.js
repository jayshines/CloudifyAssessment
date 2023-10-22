require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();
const port = 3000;

app.use(bodyParser.json()); 

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });