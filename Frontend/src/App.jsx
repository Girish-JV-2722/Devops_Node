import './App.css';
import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { awsRegions } from './constants/regions';

const TextInput = ({ name, value, onChange, placeholder, type = "text" }) => (
  <input
    type={type}
    name={name}
    value={value || ''}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
  />
);

const SelectInput = ({ name, value, onChange, options, placeholder }) => (
  <select
    name={name}
    value={value || ''}
    onChange={onChange}
    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
  >
    <option value="" disabled>{placeholder}</option>
    {options.map((option) => (
      <option key={option.code || option} value={option.code || option}>
        {option.name || option}
      </option>
    ))}
  </select>
);

function App() {
  const [formData, setFormData] = useState({});

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
    console.log('Form Data:', formData);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log('Form Data:', formData);

    if (!formData) {
      toast("Form data is incomplete");
      return;
    }

    try {
      // const response = await axios.post('/deploy', formData);
      // console.log(response.data);
      toast("Successfully deployed application");
    } catch (error) {
      toast("Oops! Something went wrong");
      // console.error('Error deploying application', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="bg-white p-8 my-8 rounded-lg shadow-lg w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-900">Deploy App on AWS</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <TextInput
            name="awsAccessKey"
            value={formData?.awsAccessKey}
            onChange={handleOnChange}
            placeholder="AWS Access Key"
          />
          <TextInput
            name="awsSecretKey"
            value={formData?.awsSecretKey}
            onChange={handleOnChange}
            placeholder="AWS Secret Key"
          />
          <SelectInput
            name="region"
            value={formData?.region}
            onChange={handleOnChange}
            options={awsRegions}
            placeholder="Select AWS Region"
          />
          <TextInput
            name="appName"
            value={formData?.appName}
            onChange={handleOnChange}
            placeholder="Application Name"
          />
          <SelectInput
            name="env"
            value={formData?.env}
            onChange={handleOnChange}
            options={['EC2', 'Elastic Beanstalk']}
            placeholder="Select Deployment Environment"
          />
          <TextInput
            name="dockerHubID"
            value={formData?.dockerHubID}
            onChange={handleOnChange}
            placeholder="Docker Hub ID"
          />
          <TextInput
            name="dockerHubPassword"
            value={formData?.dockerHubPassword}
            onChange={handleOnChange}
            placeholder="Docker Hub Password"
            type="password"
          />
          <SelectInput
            name="technology"
            value={formData?.technology}
            onChange={handleOnChange}
            options={['React', 'Node']}
            placeholder="Select Technology"
          />

          {formData?.technology === 'React' && (
            <>
              <TextInput
                name="reactVersion"
                value={formData.reactVersion || ''}
                onChange={handleOnChange}
                placeholder="React Version"
              />
              <TextInput
                name="portNumber"
                value={formData.portNumber || ''}
                onChange={handleOnChange}
                placeholder="Port Number"
              />
            </>
          )}
          <TextInput
            name="nodeVersion"
            value={formData?.nodeVersion}
            onChange={handleOnChange}
            placeholder="Node Version"
          />
          <TextInput
            name="runCommand"
            value={formData?.runCommand}
            onChange={handleOnChange}
            placeholder="App Run Command"
          />
          <TextInput
            name="buildCommand"
            value={formData?.buildCommand}
            onChange={handleOnChange}
            placeholder="App Build Command"
          />
          <TextInput
            name="githubRepo"
            value={formData?.githubRepo}
            onChange={handleOnChange}
            placeholder="GitHub Repository"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Deploy
          </button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}

export default App;
