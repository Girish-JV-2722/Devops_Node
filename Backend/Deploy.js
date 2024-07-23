const { exec } = require('child_process');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let id;

//sequilize
const { Sequelize, DataTypes } = require('sequelize');
const application = require('./models/application');
const sequelize = new Sequelize('autodevops4', 'admin', 'admin123', {
  host: process.env.DB_HOST,
  dialect: 'mysql'
});

const createEC2=async(AWS_Accesskey,AWS_Secretkey)=>{
  
  const ec2 = new AWS.EC2({
    region: 'eu-north-1',
    accessKeyId:AWS_Accesskey,
    secretAccessKey:AWS_Secretkey,
  });
  return ec2;
}



// Function to execute shell commands
function runCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error}`);
        reject(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

// Clone the Git repository
async function cloneRepo(gitUrl) {
  console.log('Cloning repository...');
  await runCommand(`git clone ${gitUrl}`);
  console.log('Repository cloned.');
}

// Build Docker image
async function buildDockerImage(DOCKER_USERNAME) {
  console.log('Building Docker image...');
  const dockerUsername = DOCKER_USERNAME;
  await runCommand(`docker rmi -f ${dockerUsername}/firstimage:latest || true`);
  await runCommand(`docker build -t ${dockerUsername}/firstimage:latest .`);
  console.log('Docker image built successfully.');
}


// Push Docker image to Docker Hub
async function pushDockerImage(DOCKER_USERNAME,DOCKER_PASSWORD) {
  console.log('Pushing Docker image to Docker Hub...');
  const dockerUsername =DOCKER_USERNAME;
  await runCommand(`docker login -u ${dockerUsername} -p ${DOCKER_PASSWORD}`);
  await runCommand(`docker push ${dockerUsername}/firstimage:latest`);
  console.log('Docker image pushed to Docker Hub successfully.');
}

// Deploy to EC2
async function deployToEC2(ec2) {
  console.log('Deploying to EC2...');

  // Read deploy.sh file
  const userDataScript = fs.readFileSync(path.join(__dirname, 'deploy.sh'), 'utf8');

  const params = {

    ImageId: 'ami-0d7e17c1a01e6fa40',
    InstanceType: 't3.micro',
    MaxCount: 1,
    MinCount: 1,
    KeyName: 'jenkin', // Replace with your key pair name
    SecurityGroupIds: ['sg-03053d2fe6a6d75b9'], // Replace with your security group ID
    UserData: Buffer.from(userDataScript).toString('base64'),
  };

  return new Promise((resolve, reject) => {
    ec2.runInstances(params, (err, data) => {
      if (err) {
        console.error('Error', err);
        reject(err);
      } else {
        const instanceId = data.Instances[0].InstanceId;
        console.log('Instance ID:', instanceId);
        // Wait for the instance to reach the 'running' state
        waitForInstanceRunning(instanceId,ec2)
          .then(instance => {
            console.log('Instance is running:', instance);
            // Get public IP address after instance is running
            return getPublicIpAddress(instanceId,ec2);
          })
          .then(publicIp => {
            console.log('Public IP Address:', publicIp);
            resolve(publicIp);
          })
          .catch(err => {
            console.error('Error deploying instance:', err);
            reject(err);
          });
      }
    });
  });
}

// Wait for instance to reach 'running' state
function waitForInstanceRunning(instanceId,ec2) {
  const params = {
    InstanceIds: [instanceId],
  };
  return new Promise((resolve, reject) => {
    ec2.waitFor('instanceRunning', params, (err, data) => {
      if (err) {
        console.error('Error waiting for instance to run:', err);
        reject(err);
      } else {
        resolve(data.Reservations[0].Instances[0]);
      }
    });
  });
}

// Get public IP address of EC2 instance
function getPublicIpAddress(instanceId,ec2) {
  const params = {
    InstanceIds: [instanceId],
  };
  return new Promise((resolve, reject) => {
    ec2.describeInstances(params, (err, data) => {
      if (err) {
        console.error('Error describing instance:', err);
        reject(err);
      } else {
        const publicIp = data.Reservations[0].Instances[0].PublicIpAddress;
        resolve(publicIp);
      }
    });
  });
}

const localPath = "C:/Users/Mandar/OneDrive/Desktop/DevOps/Devops_Node/Backend/nodejs";

// Function to remove the cloned repository
function removeClonedRepo() {
  return new Promise((resolve, reject) => {
    fs.rm(localPath, { recursive: true, force: true }, (err) => {
      if (err) {
        return reject(err);
      }
      console.log('Cloned repository removed successfully.');
      resolve();
    });
  });
}

// Main function to run all tasks
async function main(userid,AWS_Accesskey,AWS_Secretkey,gitUrl,dockerPassword,dockerUsername) {
  let publicIp;
  try {
    id=userid;
    console.log(id);
    const ec2=await createEC2(AWS_Accesskey,AWS_Secretkey);
    await cloneRepo(gitUrl);
    await buildDockerImage(dockerUsername);
    await pushDockerImage(dockerUsername,dockerPassword);
    publicIp = await deployToEC2(ec2);
    console.log('Deployment successful. Public IP Address:', publicIp);
    const data={status:true,publicIp:publicIp};
    return data;
  } catch (error) {
    console.error('Deployment failed:', error);
  } finally {
    await removeClonedRepo().catch(err => console.error(`Failed to remove cloned repository: ${err.message}`));
    return data={status:true,publicIp:publicIp,port:3000};
  }
}

module.exports = { main };
