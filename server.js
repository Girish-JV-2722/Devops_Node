const express = require('express');
const app = express();
const port = 3000;

console.log('Starting server...');

app.use(express.json());

app.post('/generate-pipeline-script', (req, res) => {
  console.log('Received request:', req.body);

  const { gitRepoUrl, dockerHubUsername, dockerHubPassword, dockerHubRepo, dockerImageName, applicationName } = req.body;

  const script = `
const simpleGit = require('simple-git');
const Docker = require('dockerode');
const shell = require('shelljs');

const gitRepoUrl = '${gitRepoUrl}';
const dockerHubUsername = '${dockerHubUsername}';
const dockerHubPassword = '${dockerHubPassword}';
const dockerHubRepo = '${dockerHubRepo}';
const dockerImageName = '${dockerImageName}';
const applicationName = '${applicationName}';
const deployScriptPath = './deploy.sh';

async function cloneRepository() {
  const git = simpleGit();
  await git.clone(gitRepoUrl, './repo');
  console.log('Repository cloned successfully.');
}

function buildCode() {
  shell.cd('./repo');
  if (shell.exec('npm install').code !== 0) {
    shell.echo('Error: npm install failed');
    shell.exit(1);
  }
  console.log('Code built successfully.');
}

async function createDockerImage() {
  const docker = new Docker();
  shell.cd('../');
  
  if (shell.exec(\`docker build -t \${dockerHubRepo}/\${dockerImageName} ./repo\`).code !== 0) {
    shell.echo('Error: Docker build failed');
    shell.exit(1);
  }
  console.log('Docker image created successfully.');
}

async function pushDockerImage() {
  if (shell.exec(\`docker login -u \${dockerHubUsername} -p \${dockerHubPassword}\`).code !== 0) {
    shell.echo('Error: Docker login failed');
    shell.exit(1);
  }

  if (shell.exec(\`docker push \${dockerHubRepo}/\${dockerImageName}\`).code !== 0) {
    shell.echo('Error: Docker push failed');
    shell.exit(1);
  }
  console.log('Docker image pushed successfully.');
}

function deployApplication() {
  if (shell.exec(\`sh \${deployScriptPath} \${dockerImageName}\`).code !== 0) {
    shell.echo('Error: Deployment failed');
    shell.exit(1);
  }
  console.log('Application deployed successfully.');
}

async function runPipeline() {
  await cloneRepository();
  buildCode();
  await createDockerImage();
  await pushDockerImage();
  deployApplication();
}

runPipeline().catch(err => console.error('Pipeline failed:', err));
`;

  res.send(`<pre>${script}</pre>`);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
