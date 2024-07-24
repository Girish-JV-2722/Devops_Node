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

const repoUrl = process.env.REPO_URL;
const backendRepoUrl = process.env.BACKEND_REPO_URL;
const frontendRepoUrl = process.env.FRONTEND_REPO_URL;
const targetDir = "C:\\Users\\jvgir\\Documents\\devops\\Devops_Node\\Backend\\cloned-repo";

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
    await runCommand(`docker build -t ${dockerUsername}/frontend-image:latest -f ./frontend.Dockerfile .`);
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

async function createKeyPair(keyName) {
  const params = {
    KeyName: keyName,
  };
  return new Promise((resolve, reject) => {
    ec2.createKeyPair(params, (err, data) => {
      if (err) {
        console.error('Error creating key pair:', err);
        reject(err);
      } else {
        const keyMaterial = data.KeyMaterial;
        const keyPath = path.join(__dirname, `${keyName}.pem`);
        fs.writeFileSync(keyPath, keyMaterial);
        console.log('Key pair created and saved to:', keyPath);
        resolve(keyPath);
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

// Deploy to EC2
async function deployToEC2(projectType) {
  console.log('Deploying to EC2...');

  // Read deploy.sh file and replace placeholders
  const userDataScript = fs.readFileSync(path.join(__dirname, 'deploy.sh'), 'utf8')
    .replace(/\${DOCKER_USERNAME}/g, process.env.DOCKER_USERNAME)
    .replace(/\${PROJECT_TYPE}/g, projectType);
  
  const securityGroupId = await getOrCreateSecurityGroup();
  const keyName = 'my-new-key-pair';
  const keyPath = await createKeyPair(keyName);

  const params = {
    ImageId: 'ami-0c9235cef0e595489',
    InstanceType: 't2.micro',
    MaxCount: 1,
    MinCount: 1,
    KeyName: keyName,
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
async function removeClonedRepo(localPath) {
  try {
    await fsExtra.emptyDir(localPath);
    console.log('Cloned repository contents removed successfully.');
  } catch (error) {
    console.error(`Failed to remove cloned repository: ${error.message}`);
  }
}

// Main function to run all tasks
async function main() {
  const projectType = 'backend'; // Change this value to 'frontend' or 'both' as needed

  try {
    await cloneRepo(repoUrl, targetDir);
    if (projectType === 'backend' || projectType === 'both') {
      await buildDockerImageBackend();
      await pushDockerImage('backend-image');
    }
    if (projectType === 'frontend' || projectType === 'both') {
      await buildDockerImageFrontend();
      await pushDockerImage('frontend-image');
    }
    const publicIp = await deployToEC2(projectType);
    console.log('Deployment successful. Public IP Address:', publicIp);
  } catch (error) {
    await removeClonedRepo(targetDir).catch(err => console.error(`Failed to remove cloned repository: ${err.message}`));
    console.error('Deployment failed:', error);
  } finally {
    await removeClonedRepo(targetDir).catch(err => console.error(`Failed to remove cloned repository: ${err.message}`));
  }
}

main();
