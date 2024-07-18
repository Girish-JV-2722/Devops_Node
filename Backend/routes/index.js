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

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('autodevops4', 'admin', 'admin123', {
  host: process.env.DB_HOST,
  dialect: 'mysql'
});

const User = require('../models/user')(sequelize, DataTypes);
const GitCredentials = require('../models/gitcredentials')(sequelize, DataTypes);
const DockerhubCredentials = require('../models/dockercredentials')(sequelize, DataTypes);
const Deployment = require('../models/deployments')(sequelize, DataTypes);

const Application= require('../models/application')(sequelize, DataTypes);
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
  
  // console.log("REQUEST:");
  //  console.log(req);
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
    .then(async (data) => {
     
  
       console.log(req.body);
    
        const {  AWS_Accesskey,AWS_Secretkey,gitToken}=req.body;
        let user = await User.findOne({ where: { id:data.id } });
        console.log(user);
        if (!user) {
         let user = await User.create({
            id: data.id,
            AWS_Accesskey,
            AWS_Secretkey,
          });
        }
          console.log(gitToken);
          let gitCredentials= await GitCredentials.findOne({ where: {userId:data.id} });
        if(!gitCredentials){
          await gitCredentials.create({
            userId:data.id,
            gitUsername: data.login,
            gitToken: gitToken,
          });
      
        }
        // } else {
        //   let GitCredentials = await gitcredentials.findOne({
        //     where: { userId: data.id },
        //   });
        //   await GitCredentials.update({ gitToken: accessToken });
        // }

      
      //application table

         //dockerhub table
      try {
    
        const {
          dockerUsername,
          dockerPassword,
         
        } = req.body;
       
    
        // let GitCredentials= await gitcredentials.findOne({ where: { gitToken: token} });

        const dockerHubCredentials = await DockerhubCredentials.create({
          userId:data.id,
          dockerUsername,
          dockerPassword,
        });
    
       
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    
        const {
    
          region,
          environment,
          gitUrl,
          nodeVersion,
        } = req.body;
        const {projectId} = req.query;
        console.log("projectId: "+projectId);
        if (!projectId) {
          return res.status(400).json({ error: "Project ID is missing" });
        }
        
        const newApplication = await Application.create({
          region,
          environment,
          gitUrl,
          // scripts,
          nodeVersion,
          projectId,
          userId:data.id,
        });
    
        
        
    
        await newApplication.save();
    
       
    
        //deployemnts
        try {
          const {environment } = req.body;
      
          // Validate the input as necessary
      
          const newDeployment = await Deployment.create({
            userId:user.id,
            applicationId:newApplication.applicationId,
            status:true,
            log:"Something",
            environment,
            createdAt: new Date(),
            updatedAt: new Date()
          });
      
          res.status(201).json(newDeployment);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'An error occurred while creating the deployment.' });
        }
      
      

      // res.json(data);
    });

});

module.exports = router;
