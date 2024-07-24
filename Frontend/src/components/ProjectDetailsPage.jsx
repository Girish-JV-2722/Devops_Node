import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { API_URL } from '../constants/api';

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
  const [formValues, setFormValues] = useState({
    projectName: '',
    description: '',
    clientName: '',
    manager: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { projectName, description, clientName, manager } = formValues;
    const newProject = {
      projectName,
      clientName,
      managerName: manager,
      description
    };

    try {
      const response = await axios.post(`${API_URL}/project/create`, newProject);
      navigate('/');
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Failed to add project. Please try again.");
    }
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prevValues => ({
      ...prevValues,
      [name]: value
    }));
  };

  const inputs = [
    { name: 'projectName', placeholder: 'Project Name' },
    { name: 'description', placeholder: 'Description' },
    { name: 'clientName', placeholder: 'Client Name' },
    { name: 'manager', placeholder: 'Manager' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 py-8">
      <div className="bg-white shadow-lg rounded-lg p-8 my-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">New Project</h1>
        <form onSubmit={handleSubmit}>
          {inputs.map((input, index) => (
            <div key={index} className="mb-4">
              <TextInput
                name={input.name}
                value={formValues[input.name]}
                onChange={handleOnChange}
                placeholder={input.placeholder}
                required
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg shadow hover:bg-blue-600 transition duration-300"
          >
            Add Project
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default ProjectDetailsPage;
