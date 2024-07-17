// ProjectDetailsPage.js

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addProject } from '../actions/projectActions'; // Define action creator
import axios from 'axios';

const TextInput = ({ name, value, onChange, placeholder, type = 'text' }) => (
  <input
    type={type}
    name={name}
    value={value || ''}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
  />
);

function ProjectDetailsPage() {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [manager, setManager] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit =async (e) => {
    e.preventDefault();
    const newProject = {
      projectName,
      clientName,
      managerName: manager,
      description,
    };
    // axios.post('http://localhost:3000/project/create', newProject); // Add project to database
    // dispatch(addProject(newProject)); // Dispatch action to add project
    // navigate('/');
    try {
      const response = await axios.post('http://localhost:3000/project/create', newProject);
      dispatch(addProject(response.data));
      navigate('/');
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Failed to add project. Please try again.");
    }
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    if (name === 'projectName') setProjectName(value);
    if (name === 'description') setDescription(value);
    if (name === 'clientName') setClientName(value);
    if (name === 'manager') setManager(value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="bg-white shadow-lg rounded-lg p-8 my-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">New Project</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <TextInput
              name="projectName"
              value={projectName}
              onChange={handleOnChange}
              placeholder="Project Name"
              required
            />
          </div>
          <div className="mb-4">
            <TextInput
              name="description"
              value={description}
              onChange={handleOnChange}
              placeholder="Description"
              required
            />
          </div>
          <div className="mb-4">
            <TextInput
              name="clientName"
              value={clientName}
              onChange={handleOnChange}
              placeholder="Client Name"
              required
            />
          </div>
          <div className="mb-4">
            <TextInput
              name="manager"
              value={manager}
              onChange={handleOnChange}
              placeholder="Manager"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg shadow hover:bg-blue-600 transition duration-300"
          >
            Add Project
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProjectDetailsPage;
