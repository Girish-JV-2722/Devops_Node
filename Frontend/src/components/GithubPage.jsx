import React, {useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import githubImage from '../assets/github.jpg';

export default function GithubPage() {
  const [accessTokenStatus, setAccessTokenStatus] = useState('idle'); // 'idle', 'success', 'failure'
  const navigate = useNavigate();
   
  useEffect(() => {
    // Check if the user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:3000/auth/github/status', { withCredentials: true });
        if (response.data.authenticated) {
          navigate('/form',{ replace: true });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    checkAuth();
    
  }, [navigate]);

  // Mock variable to decide success or failure
  // const mockSuccess = true;

  const handleGetAccessToken = async () => {
    try {
      // Simulating an API call to get GitHub access token
      // const response = await axios.get('http://localhost:3000/auth/github');
      // // const { data } = response;
      // console.log(response);
      window.location.href = 'http://localhost:3000/auth/github';

      // if (mockSuccess) {
      //   setAccessTokenStatus('success');
      //   toast("Successfully obtained GitHub access token");
      //   setTimeout(() => navigate('/form'), 2000); // Redirect to form page after 2 seconds
      // } else {
      //   setAccessTokenStatus('failure');
      //   toast("Failed to obtain GitHub access token");
      // }
    } catch (error) {
      setAccessTokenStatus('failure');
      toast("Failed to obtain GitHub access token");
    }
  };

  const handleRetry = () => {
    setAccessTokenStatus('idle');
  };

  const getButtonText = () => {
    switch (accessTokenStatus) {
      case 'success':
        return "Login to Github";
      case 'failure':
        return "Retry";
      default:
        return "Login to Github";
    }
  };

  const getButtonClass = () => {
    switch (accessTokenStatus) {
      case 'success':
        return "bg-green-600 hover:bg-green-700";
      case 'failure':
        return "bg-red-600 hover:bg-red-700";
      default:
        return "bg-blue-600 hover:bg-blue-700";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="bg-white p-8 my-8 rounded-lg shadow-lg w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">Deploy App on AWS</h1>
        <img src={githubImage} alt="GitHub" className="w-44 mx-auto mb-4" />
        {accessTokenStatus === 'failure' ? (
          <button
            type="button"
            onClick={handleRetry}
            className={`w-full text-white py-3 rounded-lg transition duration-300 ${getButtonClass()}`}
          >
            {getButtonText()}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleGetAccessToken}
            className={`w-full text-white py-3 rounded-lg transition duration-300 ${getButtonClass()}`}
          >
            {getButtonText()}
          </button>
        )}
        <ToastContainer />
      </div>
    </div>
  );
}
