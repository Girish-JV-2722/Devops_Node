var express = require("express");
var router = express.Router();
const AWS = require("aws-sdk");
// Import the mysql2 package
// Import the mysql2 package and dotenv
const { main } = require("../Deploy");
const mysql = require("mysql2");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
let deploydata = {};
// Create a connection to the database using environment variables
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const createEC2 = async (AWS_Accesskey, AWS_Secretkey, region) => {
  const ec2 = new AWS.EC2({
    region: region,
    accessKeyId: AWS_Accesskey,
    secretAccessKey: AWS_Secretkey,
  });
  return ec2;
};

async function getInstanceIpAddress(ec2, instanceId) {
  const params = {
    InstanceIds: [instanceId],
  };

  try {
    const data = await ec2.describeInstances(params).promise();
    const instance = data.Reservations[0].Instances[0];
    const ipAddress = instance.PublicIpAddress || instance.PrivateIpAddress;
    return ipAddress;
  } catch (error) {
    console.error("Error getting instance IP address:", error);
    throw error;
  }
}

const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("autodevops4", "admin", "admin123", {
  host: process.env.DB_HOST,
  dialect: "mysql",
});

const User = require("../models/user")(sequelize, DataTypes);
const GitCredentials = require("../models/gitcredentials")(
  sequelize,
  DataTypes
);
const DockerhubCredentials = require("../models/dockercredentials")(
  sequelize,
  DataTypes
);
const Deployment = require("../models/deployments")(sequelize, DataTypes);
const Project = require("../models/project")(sequelize, DataTypes);

const Application = require("../models/application")(sequelize, DataTypes);
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
      Authorization: req.get("Authorization"),
    },
  })
    .then((response) => {
      // console.log(response);
      return response.json();
    })
    .then(async (data) => {
      console.log(req.body);

      const { AWS_Accesskey, AWS_Secretkey, gitToken } = req.body;
      let user = await User.findOne({ where: { id: data.id } });
      console.log(user);
      if (!user) {
        let user = await User.create({
          id: data.id,
          AWS_Accesskey,
          AWS_Secretkey,
        });
      }
      console.log(gitToken);
      let gitCredentials = await GitCredentials.findOne({
        where: { userId: data.id },
      });
      if (!gitCredentials) {
        await gitCredentials.create({
          userId: data.id,
          gitUsername: data.login,
          gitToken: gitToken,
        });
      }

      //dockerhub table

      const { dockerUsername, dockerPassword } = req.body;

      // let GitCredentials= await gitcredentials.findOne({ where: { gitToken: token} });

      const dockerHubCredentials = await DockerhubCredentials.create({
        userId: data.id,
        dockerUsername,
        dockerPassword,
      });

      const {
        region,
        environment,
        gitUrl,
        nodeVersion,
        portNumber,
        backendRepoUrl,
        frontendRepoUrl,
        frontendNodeVersion,
      } = req.body;
      const { projectId } = req.query;
      console.log("projectId: " + projectId);
      if (!projectId) {
        return res.status(400).json({ error: "Project ID is missing" });
      }

      // await newApplication.save();

      // const AWS_Accesskey=user.AWS_Accesskey;
      // const AWS_Secretkey=user.AWS_Secretkey;
      // const gitUrl=application.gitUrl;
      // // const DOCKER_USERNAME=dockercredentials.dockerUsername;
      // // const DOCKER_PASSWORD=dockercredentials.dockerPassword;
      let project = await Project.findOne({ where: { projectId: projectId } });
      let projectName = project.projectName;
      console.log(projectName);
      deploydata = await main(
        data.id,
        AWS_Accesskey,
        AWS_Secretkey,
        region,
        dockerPassword,
        dockerUsername,
        portNumber,
        nodeVersion,
        backendRepoUrl,
        frontendRepoUrl,
        projectName,
        frontendNodeVersion
      );

      console.log(deploydata);

      //Application

      const newApplication = await Application.create({
        region,
        environment,
        gitUrl,
        // scripts,
        nodeVersion,
        projectId,
        userId: data.id,
        status: deploydata.status,
        ipAddress: deploydata.publicIp,
        port: deploydata.port,
        frontendInstanceId: deploydata.frontendInstanceId,
        backendInstanceId: deploydata.backendInstanceId,
        backendIp: deploydata.backendIp,
      });

      //deployemnts
      try {
        const { environment } = req.body;

        // Validate the input as necessary

        const newDeployment = await Deployment.create({
          userId: user.id,
          applicationId: newApplication.applicationId,
          status: 1,
          log: "Something",
          environment,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        res.status(201).json({ newDeployment, deploydata });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ error: "An error occurred while creating the deployment." });
      }

      // res.json(data);
    });
});

router.get("/getAllApp", async function (req, res, next) {
  try {
    // let projects= await Project.findAll();
    // let deployments= await Deployment.findAll();
    let applications = await Application.findAll();
    let projects = await Project.findAll();
    res.status(200).json({ deploydata, applications, projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get(`/configure/:projectId/success`, async function (req, res, next) {
  try {
    const projectId = req.params.projectId;
    let projects = await Project.findOne({ projectId: projectId });
    let applications = await Application.findOne({ projectId: projectId });

    res.status(200).json({ deploydata, applications, projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/stopInstance", async function (req, res) {
  const { frontendInstanceId, backendInstanceId } = req.query;
  let application = await Application.findOne({
    where: { frontendInstanceId: frontendInstanceId },
  });
  let user = await User.findOne({ id: application.userId });

  const ec2 = await createEC2(
    user.AWS_Accesskey,
    user.AWS_Secretkey,
    application.region
  );
  const params = {
    InstanceIds: [frontendInstanceId],
  };

  try {
    const data = await ec2.stopInstances(params).promise();
    application.status = "stopped";
    await application.save();
    res.status(200).json(data.StoppingInstances);
  } catch (err) {
    res.status(200).json({ error: err });
  }
});

router.get("/startInstance", async function (req, res) {
  const { frontendInstanceId, backendInstanceId } = req.query;
  let application = await Application.findOne({
    where: { frontendInstanceId: frontendInstanceId },
  });
  let user = await User.findOne({ where: { id: application.userId } });

  const ec2 = await createEC2(
    user.AWS_Accesskey,
    user.AWS_Secretkey,
    application.region
  );

  const params = {
    InstanceIds: [frontendInstanceId, backendInstanceId],
  };

  try {
    const data = await ec2.startInstances(params).promise();

    const ipAddress = await getInstanceIpAddress(ec2, frontendInstanceId);
    await Application.update(
      { ipAddress: ipAddress, status: "deployed" },
      {
        where: {
          applicationId: application.applicationId,
        },
      }
    );

    res.status(200).json(data.StartingInstances);
  } catch (err) {
    res.status(200).json({ error: err });
  }
});

router.get("/terminateInstance", async function (req, res) {
  const { frontendInstanceId, backendInstanceId } = req.query;

  let application = await Application.findOne({
    frontendInstanceId: frontendInstanceId,
  });
  let user = await User.findOne({ id: application.userId });

  const ec2 = await createEC2(
    user.AWS_Accesskey,
    user.AWS_Secretkey,
    application.region
  );

  const params = {
    InstanceIds: [frontendInstanceId, backendInstanceId],
  };

  try {
    const data = await ec2.terminateInstances(params).promise();
    try {
      const result = await Application.destroy({
        where: {
          applicationId: application.applicationId,
        },
      });

      if (result === 0) {
        console.log("No application found with the given ID.");
      } else {
        console.log("Application deleted successfully.");
      }
    } catch (error) {
      console.error("Error deleting application:", error);
    }
    res.status(200).json(data.TerminatingInstances);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.get("/instanceStatus", async function (req, res) {
  const { frontendInstanceId } = req.query;

  let application = await Application.findOne({
    where: { frontendInstanceId: frontendInstanceId },
  });
  let user = await User.findOne({ where: { id: application.userId } });

  const ec2 = await createEC2(
    user.AWS_Accesskey,
    user.AWS_Secretkey,
    application.region
  );

  try {
    const params = {
      InstanceIds: [frontendInstanceId],
    };

    // Describe instance status
    const data = await ec2.describeInstanceStatus(params).promise();

    if (data.InstanceStatuses.length === 0) {
      console.log(
        `Instance ${frontendInstanceId} does not exist or is not in a running or stopped state.`
      );
      return;
    }

    // Extract instance status information
    const instanceStatus = data.InstanceStatuses[0];
    const systemStatus = instanceStatus.SystemStatus.Status;
    const instanceState = instanceStatus.InstanceState.Name;

    console.log(`Instance ${frontendInstanceId} Status:`);
    console.log(`- System Status: ${systemStatus}`);
    console.log(`- Instance State: ${instanceState}`);

    if (instanceState === "running") {
      const instanceHealth = instanceStatus.InstanceStatus.Status;
      console.log(`- Instance Health: ${instanceHealth}`);
      res
        .status(200)
        .json({ instanceHealth: instanceHealth, instanceState: instanceState });
    } else {
      res.status(200).json({ data: instanceState });
    }
  } catch (error) {
    console.error("Error describing instance status:", error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;
