var express = require("express");
var router = express.Router();
// const ensureAuthenticated = require('../middleware/authMiddleware');
const passport = require("passport");

const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("autodevops4", "admin", "admin123", {
  host: process.env.DB_HOST,
  dialect: "mysql",
});


const Deployment = require('../models/deployments')(sequelize, DataTypes);


const Project = require("../models/project")(sequelize, DataTypes);
const Application = require("../models/application")(sequelize, DataTypes);
const gitcredentials = require('../models/gitcredentials')(sequelize, DataTypes);
/* GET users listing. */
router.post("/create", async function (req, res, next) {
  try {

    const { projectName, clientName, managerName, description } = req.body;

    const project = await Project.create({
      projectName,
      clientName,
      managerName,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
     
    });
    // let projectData= await Project.findOne({ where: { gitToken: token} });
    res.status(201).json(project);
    console.log(project);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create project" });
  }
});


router.post("/createApp", async function (req, res, next) {
  try {
    
    const {
      token,
      region,
      environment,
      gitUrl,
      nodeVersion,
    } = req.body;
    const {projectId} = req.query;

    let GitCredentials= await gitcredentials.findOne({ where: { gitToken: token} });
    const newApplication = await Application.create({
      region,
      environment,
      gitUrl,
      scripts,
      nodeVersion,
      projectId
    });

    newApplication.userId = GitCredentials.userId;
    newApplication.projectId=projectId;

    await newApplication.save();

    newApplication.save()

    res.status(201).json(newApplication);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  });


  router.get("/getAllProjects", async function (req, res, next) {
    try {
      let projects= await Project.findAll();
      res.status(201).json(projects);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
    });

    
 

    
module.exports = router;
