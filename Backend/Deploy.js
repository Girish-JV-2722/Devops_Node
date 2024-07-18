const { exec } = require('child_process');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configure AWS
const ec2 = new AWS.EC2({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const repoUrl = process.env.REPO_URL;
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
async function cloneRepo() {
  console.log('Cloning repository...');
  await runCommand(`git clone ${repoUrl}`);
  console.log('Repository cloned.');
}

// Build Docker image
async function buildDockerImage() {
  console.log('Building Docker image...');
  const dockerUsername = process.env.DOCKER_USERNAME;
  await runCommand(`docker rmi -f ${dockerUsername}/firstimage:latest || true`);
  await runCommand(`docker build -t ${dockerUsername}/firstimage:latest .`);
  console.log('Docker image built successfully.');
}


// Push Docker image to Docker Hub
async function pushDockerImage() {
  console.log('Pushing Docker image to Docker Hub...');
  const dockerUsername = process.env.DOCKER_USERNAME;
  await runCommand(`docker login -u ${dockerUsername} -p ${process.env.DOCKER_PASSWORD}`);
  await runCommand(`docker push ${dockerUsername}/firstimage:latest`);
  console.log('Docker image pushed to Docker Hub successfully.');
}

// Deploy to EC2
async function deployToEC2() {
  console.log('Deploying to EC2...');

  // Read deploy.sh file
  const userDataScript = fs.readFileSync(path.join(__dirname, 'deploy.sh'), 'utf8');

  const params = {
    ImageId: 'ami-0c9235cef0e595489',
    InstanceType: 't2.micro',
    MaxCount: 1,
    MinCount: 1,
    KeyName: 'hello-world', // Replace with your key pair name
    SecurityGroupIds: ['sg-08886571fc2a87027'], // Replace with your security group ID
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
        waitForInstanceRunning(instanceId)
          .then(instance => {
            console.log('Instance is running:', instance);
            // Get public IP address after instance is running
            return getPublicIpAddress(instanceId);
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
function waitForInstanceRunning(instanceId) {
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
function getPublicIpAddress(instanceId) {
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
async function main() {
  try {
    await cloneRepo();
    await buildDockerImage();
    await pushDockerImage();
    const publicIp = await deployToEC2();
    console.log('Deployment successful. Public IP Address:', publicIp);
  } catch (error) {
    console.error('Deployment failed:', error);
  } finally {
    await removeClonedRepo().catch(err => console.error(`Failed to remove cloned repository: ${err.message}`));
  }
}

main();
