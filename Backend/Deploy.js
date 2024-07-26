const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const AWS = require('aws-sdk');
const fsExtra = require('fs-extra');

require('dotenv').config();

const ec2 = new AWS.EC2({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const backendRepoUrl = process.env.BACKEND_REPO_URL;
const frontendRepoUrl = process.env.FRONTEND_REPO_URL;
const targetDir_backend = "./cloned-repo-backend";
const targetDir_frontend = "./cloned-repo-frontend";

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

async function cloneRepo(url, targetDir) {
  try {
    if (!fsExtra.existsSync(targetDir)) {
      await fsExtra.mkdir(targetDir, { recursive: true });
      console.log(`Created directory ${targetDir}`);
    }
    console.log(`Cloning repository from ${url} into ${targetDir}...`);
    await runCommand(`git clone ${url} ${targetDir}`);
    console.log('Repository cloned.');
  } catch (error) {
    console.error(`Error cloning repository: ${error}`);
  }
}


async function addconfig(){
  try {
    
  
    // Define paths
    const configDir = path.join(targetDir_backend, 'config');
    const oldConfigFile = path.join(configDir, 'config.json');
    const newConfigFile = path.join(configDir, 'config.js');

    console.log("mandar"+oldConfigFile);
    // Remove existing config.json if it exists
    if (await fsExtra.pathExists(oldConfigFile)) {
      await fsExtra.remove(oldConfigFile);
      console.log('Existing config.json removed');
    }

    // New config.js content
    const newConfigContent = `module.exports = {
      development: {
        username: process.env.DB_USER || 'youruser',
        password: process.env.DB_PASSWORD || 'yourpassword',
        database: process.env.DB_NAME || 'yourdatabase',
        host: process.env.DB_HOST || 'db',
        dialect: 'mysql'
      },
      test: {
        username: process.env.DB_USER || 'youruser',
        password: process.env.DB_PASSWORD || 'yourpassword',
        database: process.env.DB_NAME_TEST || 'yourdatabase_test',
        host: process.env.DB_HOST || 'db',
        dialect: 'mysql'
      },
      prod: {
        username: process.env.DB_USER || 'youruser',
        password: process.env.DB_PASSWORD || 'yourpassword',
        database: process.env.DB_NAME_PRODUCTION || 'yourdatabase_production',
        host: process.env.DB_HOST || 'db',
        dialect: 'mysql'
      }
    };`;

    // Write new config.js
    await fsExtra.outputFile(newConfigFile, newConfigContent);
    console.log('New config.js added successfully');

  } catch (error) {
    console.error('Error:', error);
  }
}
async function buildDockerImageBackend() {
  try {
    console.log('Building Docker image for backend...');
    const dockerUsername = process.env.DOCKER_USERNAME;
    if (!dockerUsername) {
      throw new Error('DOCKER_USERNAME environment variable is not set.');
    }
    await runCommand(`docker rmi -f ${dockerUsername}/backend-image:latest || true`);
    await runCommand(`docker build -t ${dockerUsername}/backend-image:latest -f ./Backend-DockerFile/Dockerfile .`);
    console.log('Backend Docker image built successfully.');
  } catch (error) {
    console.error(`Failed to build Docker image: ${error}`);
  }
}

async function buildDockerImageFrontend() {
  try {
    console.log('Building Docker image for frontend...');
    const dockerUsername = process.env.DOCKER_USERNAME;
    if (!dockerUsername) {
      throw new Error('DOCKER_USERNAME environment variable is not set.');
    }
    await runCommand(`docker rmi -f ${dockerUsername}/frontend-image:latest || true`);
    await runCommand(`docker build -t ${dockerUsername}/frontend-image:latest -f ./frontend-Dockerfile/Dockerfile .`);
    console.log('Frontend Docker image built successfully.');
  } catch (error) {
    console.error(`Failed to build Docker image: ${error}`);
  }
}

async function pushDockerImage(imageName) {
  console.log(`Pushing Docker image ${imageName} to Docker Hub...`);
  const dockerUsername = process.env.DOCKER_USERNAME;
  await runCommand(`docker login -u ${dockerUsername} -p ${process.env.DOCKER_PASSWORD}`);
  await runCommand(`docker push ${dockerUsername}/${imageName}:latest`);
  console.log(`${imageName} Docker image pushed to Docker Hub successfully.`);
}

async function getOrCreateSecurityGroup() {
  // Check if security group exists
  const params = {
    Filters: [
      {
        Name: 'group-name',
        Values: ['ec2-security-group']
      }
    ]
  };

  return new Promise((resolve, reject) => {
    ec2.describeSecurityGroups(params, async (err, data) => {
      if (err) {
        console.error('Error describing security groups:', err);
        reject(err);
      } else {
        const existingGroup = data.SecurityGroups.find(sg => sg.GroupName === 'ec2-security-group');
        if (existingGroup) {
          console.log('Security group already exists:', existingGroup.GroupId);
          resolve(existingGroup.GroupId);
        } else {
          // Create a new security group
          const createParams = {
            Description: 'Security group for EC2 instance',
            GroupName: 'ec2-security-group'
          };
          try {
            const result = await ec2.createSecurityGroup(createParams).promise();
            console.log('Created new security group:', result.GroupId);
            // Add inbound rules to the new security group
            await addInboundRules(result.GroupId);
            resolve(result.GroupId);
          } catch (createErr) {
            console.error('Error creating security group:', createErr);
            reject(createErr);
          }
        }
      }
    });
  });
}


async function addInboundRules(securityGroupId) {
  const params = {
    GroupId: securityGroupId,
    IpPermissions: [
      {
        IpProtocol: 'tcp',
        FromPort: 3000,
        ToPort: 3000,
        IpRanges: [{ CidrIp: '0.0.0.0/0' }],
      },
      {
        IpProtocol: 'tcp',
        FromPort: 80,
        ToPort: 80,
        IpRanges: [{ CidrIp: '0.0.0.0/0' }],
      },
    ],
  };

  return new Promise((resolve, reject) => {
    ec2.authorizeSecurityGroupIngress(params, (err, data) => {
      if (err) {
        console.error('Error adding inbound rules:', err);
        reject(err);
      } else {
        console.log('Inbound rules added successfully:', data);
        resolve(data);
      }
    });
  });
}

//Backend Deploy to EC2
async function deployToEC2(projectType) {
  console.log('Deploying to EC2...');

  // Read deploy.sh file and replace placeholders
  const userDataScript = fs.readFileSync(path.join(__dirname, 'deploy.sh'), 'utf8')
    .replace(/\${DOCKER_USERNAME}/g, process.env.DOCKER_USERNAME)
    .replace(/\${PROJECT_TYPE}/g, projectType)
    .replace(/\${MYSQL_ROOT_PASSWORD}/g, process.env.MYSQL_ROOT_PASSWORD)
    .replace(/\${MYSQL_DATABASE}/g, process.env.MYSQL_DATABASE)
    .replace(/\${MYSQL_USER}/g, process.env.MYSQL_USER)
    .replace(/\${MYSQL_PASSWORD}/g, process.env.MYSQL_PASSWORD);
  
  const securityGroupId = await getOrCreateSecurityGroup();

  const params = {
    ImageId: 'ami-0427090fd1714168b',
    InstanceType: 't2.micro',
    MaxCount: 1,
    MinCount: 1,
    SecurityGroupIds: [securityGroupId],
    UserData: Buffer.from(userDataScript).toString('base64'),
  };

  return new Promise((resolve, reject) => {
    ec2.runInstances(params, async (err, data) => {
      if (err) {
        console.error('Error', err);
        reject(err);
      } else {
        const instanceId = data.Instances[0].InstanceId;
        console.log('Instance ID:', instanceId);

        // Wait for the instance to reach the 'running' state
        await waitForInstanceToRun(instanceId);
        const publicIp = await getPublicIpAddress(instanceId);
        resolve(publicIp);
      }
    });
  });
}

//Frontend deploying
async function deployFrontendToEC2(projectType,backendIp) {
  console.log('Deploying to EC2...');

  // Read deploy.sh file and replace placeholders
  const userDataScript = fs.readFileSync(path.join(__dirname, 'deploy.sh'), 'utf8')
    .replace(/\${DOCKER_USERNAME}/g, process.env.DOCKER_USERNAME)
    .replace(/\${PROJECT_TYPE}/g, projectType)
    .replace(/\${BACKEND_IP}/g,backendIp);
    
  
  const securityGroupId = await getOrCreateSecurityGroup();

  const params = {
    ImageId: 'ami-0427090fd1714168b',
    InstanceType: 't2.micro',
    MaxCount: 1,
    MinCount: 1,
    SecurityGroupIds: [securityGroupId],
    UserData: Buffer.from(userDataScript).toString('base64'),
  };

  return new Promise((resolve, reject) => {
    ec2.runInstances(params, async (err, data) => {
      if (err) {
        console.error('Error', err);
        reject(err);
      } else {
        const instanceId = data.Instances[0].InstanceId;
        console.log('Instance ID:', instanceId);

        // Wait for the instance to reach the 'running' state
        await waitForInstanceToRun(instanceId);
        const publicIp = await getPublicIpAddress(instanceId);
        resolve(publicIp);
      }
    });
  });
}

// Wait for instance to run
function waitForInstanceToRun(instanceId) {
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
async function removeClonedRepo(targetDir_backend, targetDir_frontend) {
  try {
    await fsExtra.emptyDir(targetDir_backend);
    await fsExtra.emptyDir(targetDir_frontend);
    console.log('Cloned repository contents removed successfully.');
  } catch (error) {
    console.error(`Failed to remove cloned repository: ${error.message}`);
  }
}

// Main function to run all tasks
async function main() {
  const projectType = 'backend'; // Change this value to 'frontend' or 'both' as needed

  try {
   
      await cloneRepo(backendRepoUrl, targetDir_backend);
      await addconfig();
      await buildDockerImageBackend();
      await pushDockerImage('backend-image');
    
   
      await cloneRepo(frontendRepoUrl, targetDir_frontend);
      await buildDockerImageFrontend();
      await pushDockerImage('frontend-image');
    
      const backendIp = await deployToEC2('backend');
      const publicIp = await deployFrontendToEC2('frontend',backendIp);
      console.log('Deployment successful. frontend IP Address:', publicIp);
      console.log('Deployment successful. backend IP Address:', backendIp);
  } catch (error) {
    await removeClonedRepo(targetDir_backend, targetDir_frontend).catch(err => console.error(`Failed to remove cloned repository: ${err.message}`));
    console.error('Deployment failed:', error);
  } finally {
    await removeClonedRepo(targetDir_backend, targetDir_frontend).catch(err => console.error(`Failed to remove cloned repository: ${err.message}`));
  }
}

main();
