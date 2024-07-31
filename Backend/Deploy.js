const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const AWS = require('aws-sdk');
const fsExtra = require('fs-extra');

require('dotenv').config();

let backendInstanceId;
let frontendInstanceId;

const createEC2=async(AWS_Accesskey,AWS_Secretkey,region)=>{
  
  const ec2 = new AWS.EC2({
    region:region,
    accessKeyId:AWS_Accesskey,
    secretAccessKey:AWS_Secretkey,
  });
  return ec2;
}

// const backendRepoUrl = process.env.BACKEND_REPO_URL;
// const frontendRepoUrl = process.env.FRONTEND_REPO_URL;
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

async function updateOrCreateEnvFile(repoPath, backendIp) {
  const envFilePath = path.join(repoPath, '.env');
  const envVar = `VITE_BACKEND_URL="http://${backendIp}"`;
  
  if (fs.existsSync(envFilePath)) {
    // Read the existing .env file
    let envFileContent = fs.readFileSync(envFilePath, 'utf-8');
    
    if (envFileContent.includes('VITE_BACKEND_URL')) {
      // Update the existing VITE_BACKEND_URL
      envFileContent = envFileContent.replace(/VITE_BACKEND_URL=.*/, envVar);
    } else {
      // Append the VITE_BACKEND_URL variable
      envFileContent += `\n${envVar}`;
    }
    
    // Write the updated content back to the .env file
    fs.writeFileSync(envFilePath, envFileContent, 'utf-8');
  } else {
    // Create a new .env file with the VITE_BACKEND_URL variable
    fs.writeFileSync(envFilePath, envVar, 'utf-8');
  }
}

async function buildDockerImageBackend(dockerUsername,portNumber,nodeVersion,backendRepoUrl,projectName) {
  let parts = backendRepoUrl.split('/');
  let AppDir = parts[parts.length - 1].replace('.git', '');
  
  const nodeversion = nodeVersion ;
  const appDir = AppDir ;
  const appPort = portNumber ;

  try {
    console.log('Building Docker image for backend...');
  
    if (!dockerUsername) {
      throw new Error('DOCKER_USERNAME environment variable is not set.');
    }
    await runCommand(`docker rmi -f ${dockerUsername}/${projectName.toLowerCase()}-backend-image:latest || true`);
    await runCommand(`docker build --build-arg NODE_VERSION=${nodeversion} --build-arg APP_PORT=${appPort} -t ${dockerUsername}/${projectName.toLowerCase()}-backend-image:latest -f ./Backend-DockerFile/Dockerfile .`);
    console.log('Backend Docker image built successfully.');
  } catch (error) {
    console.error(`Failed to build Docker image: ${error}`);
  }
}

async function buildDockerImageFrontend(dockerUsername,projectName,frontendNodeVersion){
  try {
    console.log('Building Docker image for frontend...');
 
    if (!projectName) {
      throw new Error('projectName environment variable is not set.');
    }
    await runCommand(`docker rmi -f ${dockerUsername}/${projectName.toLowerCase()}-frontend-image:latest || true`);
    await runCommand(`docker build --build-arg NODE_VERSION=${frontendNodeVersion}  -t ${dockerUsername}/${projectName.toLowerCase()}-frontend-image:latest -f ./frontend-Dockerfile/Dockerfile .`);
    console.log('Frontend Docker image built successfully.');
  } catch (error) {
    console.error(`Failed to build Docker image: ${error}`);
  }
}

async function pushDockerImage(imageName,dockerUsername,dockerPassword,projectName) {
  console.log(`Pushing Docker image ${imageName} to Docker Hub...`);
  // const dockerUsername = DOCKER_USERNAME;
  await runCommand(`docker login -u ${dockerUsername} -p ${dockerPassword}`);
  await runCommand(`docker push ${dockerUsername}/${projectName.toLowerCase()}-${imageName}:latest`);
  console.log(`${imageName} Docker image pushed to Docker Hub successfully.`);
}

async function getOrCreateSecurityGroup(ec2,portNumber) {
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
            await addInboundRules(ec2,result.GroupId,portNumber);
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


async function addInboundRules(ec2,securityGroupId,portNumber) {
  const params = {
    GroupId: securityGroupId,
    IpPermissions: [
      {
        IpProtocol: 'tcp',
        FromPort: portNumber,
        ToPort: portNumber,
        IpRanges: [{ CidrIp: '0.0.0.0/0' }],
      },
      {
        IpProtocol: 'tcp',
        FromPort: 80,
        ToPort: 80,
        IpRanges: [{ CidrIp: '0.0.0.0/0' }],
      },
      {
        IpProtocol: 'tcp',
        FromPort: 3306,
        ToPort: 3306,
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
async function getOrCreateKeyPair(ec2, keyName) {
    try {
      const keyPairs = await ec2.describeKeyPairs({ KeyNames: [keyName] }).promise();
      if (keyPairs.KeyPairs.length > 0) {
        console.log(`Key pair ${keyName} already exists.`);
        return keyName;
      }
    } catch (err) {
      if (err.code !== 'InvalidKeyPair.NotFound') {
        console.error('Error describing key pairs:', err);
        throw err;
      }
    }
  
    const params = {
      KeyName: keyName,
    };
  
    try {
      const result = await ec2.createKeyPair(params).promise();
      console.log(`Created new key pair ${keyName}`);
      fs.writeFileSync(`${keyName}.pem`, result.KeyMaterial);
      console.log(`Saved key pair to ${keyName}.pem`);
      return keyName;
    } catch (err) {
      console.error('Error creating key pair:', err);
      throw err;
    }
}

//Backend Deploy to EC2
async function deployToEC2(ec2,projectType,dockerUsername,projectName,portNumber) {
  // Read deploy.sh file and replace placeholders
  const userDataScript = fs.readFileSync(path.join(__dirname, 'deploy.sh'), 'utf8')
    .replace(/\${DOCKER_USERNAME}/g, dockerUsername)
    .replace(/\${PROJECT_TYPE}/g, projectType)
    .replace(/\${MYSQL_ROOT_PASSWORD}/g, process.env.MYSQL_ROOT_PASSWORD)
    .replace(/\${MYSQL_DATABASE}/g, process.env.MYSQL_DATABASE)
    .replace(/\${MYSQL_USER}/g, process.env.MYSQL_USER)
    .replace(/\${MYSQL_PASSWORD}/g, process.env.MYSQL_PASSWORD)
    .replace(/\${projectName}/g, projectName.toLowerCase())
    .replace(/\${portNumber}/g, portNumber);
  const securityGroupId = await getOrCreateSecurityGroup(ec2,portNumber);
  const KeyName = await getOrCreateKeyPair(ec2, process.env.KEY_PAIR);
  const params = {
    ImageId: 'ami-0427090fd1714168b',
    InstanceType: 't2.micro',
    MaxCount: 1,
    MinCount: 1,
    KeyName: KeyName,
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
        backendInstanceId=instanceId;
        console.log('Instance ID:', instanceId);

        // Wait for the instance to reach the 'running' state
        await waitForInstanceToRun(instanceId,ec2);
        const publicIp = await getPublicIpAddress(instanceId,ec2);
        resolve(publicIp);
      }
    });
  });
}

//Frontend deploying
async function deployFrontendToEC2(ec2,projectType,dockerUsername,backendIp,projectName) {
  console.log('Deploying to EC2...');

  // Read deploy.sh file and replace placeholders
  const userDataScript = fs.readFileSync(path.join(__dirname, 'deploy.sh'), 'utf8')
    .replace(/\${DOCKER_USERNAME}/g,dockerUsername)
    .replace(/\${PROJECT_TYPE}/g, projectType)
    .replace(/\${BACKEND_IP}/g,backendIp)
    .replace(/\${projectName}/g, projectName.toLowerCase());
    
  
  const securityGroupId = await getOrCreateSecurityGroup(ec2);
  const KeyName = await getOrCreateKeyPair(ec2, process.env.KEY_PAIR);

  const params = {
    ImageId: 'ami-0427090fd1714168b',
    InstanceType: 't2.micro',
    MaxCount: 1,
    MinCount: 1,
    KeyName: KeyName,
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
        frontendInstanceId=instanceId;
        console.log('Instance ID:', instanceId);

        // Wait for the instance to reach the 'running' state
        await waitForInstanceToRun(instanceId,ec2);
        const publicIp = await getPublicIpAddress(instanceId,ec2);
        resolve(publicIp);
      }
    });
  });
}

// Wait for instance to run
function waitForInstanceToRun(instanceId,ec2) {
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
async function waitForInstanceChecks(ec2, instanceId) {
  const params = {
    InstanceIds: [instanceId],
  };

  try {
    await ec2.waitFor('instanceStatusOk', params).promise();
    console.log('Instance status is OK.');
    
    await ec2.waitFor('systemStatusOk', params).promise();
    console.log('System status is OK.');
    
    const data = await ec2.describeInstances(params).promise();
    return data.Reservations[0].Instances[0];
  } catch (err) {
    console.error('Error waiting for instance or system status to be OK:', err);
    throw err;
  }
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
async function main(userid,AWS_Accesskey,AWS_Secretkey,region,dockerPassword,dockerUsername,portNumber,nodeVersion,backendRepoUrl,frontendRepoUrl,projectName,frontendNodeVersion) {
  const projectType = 'backend'; // Change this value to 'frontend' or 'both' as needed
  let publicIp;
  let backendIp;
  let status;
  try {
    console.log(projectName);

      const ec2=await createEC2(AWS_Accesskey,AWS_Secretkey,region);

      await cloneRepo(backendRepoUrl, targetDir_backend);
      await addconfig();
      await buildDockerImageBackend(dockerUsername,portNumber,nodeVersion,backendRepoUrl,projectName);
      await pushDockerImage('backend-image',dockerUsername,dockerPassword,projectName);
    
      await cloneRepo(frontendRepoUrl, targetDir_frontend);
      backendIp = await deployToEC2(ec2,'backend',dockerUsername,projectName,portNumber);
      console.log('Deployment successful. backend IP Address:', backendIp);

      await updateOrCreateEnvFile(targetDir_frontend, backendIp);
      await buildDockerImageFrontend(dockerUsername,projectName,frontendNodeVersion);
      await pushDockerImage('frontend-image',dockerUsername,dockerPassword,projectName);
      publicIp = await deployFrontendToEC2(ec2,'frontend',dockerUsername,backendIp,projectName);
      await waitForInstanceChecks(ec2, frontendInstanceId);
      console.log('Deployment successful. frontend IP Address:', publicIp);
      status="deployed";
      const data={status:status,publicIp:publicIp,port:portNumber,frontendInstanceId:frontendInstanceId,backendInstanceId:backendInstanceId,backendIp:backendIp};
      return data;
      
  } catch (error) {
     status="failed"
    await removeClonedRepo(targetDir_backend, targetDir_frontend).catch(err => console.error(`Failed to remove cloned repository: ${err.message}`));
    return data={status:status,error};
  } finally {
    await removeClonedRepo(targetDir_backend, targetDir_frontend).catch(err => console.error(`Failed to remove cloned repository: ${err.message}`));
    return data={ status:status,publicIp:publicIp,port:portNumber,frontendInstanceId,backendInstanceId,backendIp:backendIp};
  }
}

module.exports = { main };
