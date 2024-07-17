var express = require("express");
var router = express.Router();
// Import the mysql2 package
// Import the mysql2 package and dotenv
const mysql = require("mysql2");
const fetch = (...args) =>import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Create a connection to the database using environment variables
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database");
});

/* GET home page. */
router.get("/getAccessToken", async function (req, res, next) {
  console.log(req.query.code);
  const params =
    "?client_id=" +
    process.env.GITHUB_CLIENT_ID +
    "&client_secret=" +
    process.env.GITHUB_SECRET_KEY +
    "&code=" +
    req.query.code;
  await fetch("https://github.com/login/oauth/access_token" + params, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .then((data) => {
      console.log(data);
      res.json(data);
    });
});

router.post("/configureApplication", async function (req, res) {
  req.get("Authorization"); // Bearer accesstoken
  
  console.log("REQUEST:");
   console.log(req);
  await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      "Authorization": req.get("Authorization"),
      
    },
  })
    .then((response) => {
      // console.log(response);
      return response.json();
    })
    .then((data) => {
      
      // console.log(data);
      res.json(data);
    });

});

module.exports = router;
