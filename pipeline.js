const simpleGit = require('simple-git');
const Docker = require('dockerode');
const shell = require('shelljs');

// Configuration
const gitRepoUrl = 'https://github.com/Girish-JV-2722/nodejs.git'; // Replace with user input
const dockerHubUsername = 'girish2722'; // Replace with user input
const dockerHubPassword = 'Jv@9866539869'; // Replace with user input
const dockerHubRepo = 'your-dockerhub-repo'; // Replace with user input
const dockerImageName = 'first'; // Replace with user input
const applicationName = 'your-application-name'; // Replace with user input
const deployScriptPath = './deploy.sh'; // Path to your deployment script

// Step 1: Clone the Git repository
async function cloneRepository() {
  const git = simpleGit();
  await git.clone(gitRepoUrl, 'https://github.com/Girish-JV-2722/nodejs.git');
  console.log('Repository cloned successfully.');
}

// Step 2: Build the code (assuming a Node.js project)
function buildCode() {
  shell.cd('./repo');
  if (shell.exec('npm install').code !== 0) {
    shell.echo('Error: npm install failed');
    shell.exit(1);
  }
  console.log('Code built successfully.');
}

// Step 3: Create Docker image
async function createDockerImage() {
  const docker = new Docker();
  shell.cd('../'); // Go back to the root directory

  if (shell.exec(`docker build -t ${dockerHubRepo}/${dockerImageName} ./repo`).code !== 0) {
    shell.echo('Error: Docker build failed');
    shell.exit(1);
  }
  console.log('Docker image created successfully.');
}

// Step 4: Push Docker image to Docker Hub
async function pushDockerImage() {
  if (shell.exec(`docker login -u ${dockerHubUsername} -p ${dockerHubPassword}`).code !== 0) {
    shell.echo('Error: Docker login failed');
    shell.exit(1);
  }

  if (shell.exec(`docker push ${dockerHubRepo}/${dockerImageName}`).code !== 0) {
    shell.echo('Error: Docker push failed');
    shell.exit(1);
  }
  console.log('Docker image pushed successfully.');
}

// Step 5: Deploy the application
function deployApplication() {
  if (shell.exec(`sh ${deployScriptPath} ${dockerImageName}`).code !== 0) {
    shell.echo('Error: Deployment failed');
    shell.exit(1);
  }
  console.log('Application deployed successfully.');
}

// Main function to run the pipeline
async function runPipeline() {
  await cloneRepository();
  buildCode();
  await createDockerImage();
  await pushDockerImage();
  deployApplication();
}

runPipeline().catch(err => console.error('Pipeline failed:', err));
