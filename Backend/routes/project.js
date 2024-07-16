var express = require("express");
var router = express.Router();
// const ensureAuthenticated = require('../middleware/authMiddleware');
const passport = require("passport");

const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("autodevops4", "admin", "admin123", {
  host: process.env.host,
  dialect: "mysql",
});

const Project = require("../models/project")(sequelize, DataTypes);
/* GET users listing. */
router.post("/createApp", async function (req, res, next) {
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
    res.status(201).json(project);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create project" });
  }
});


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
      res.status(201).json(project);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

module.exports = router;
