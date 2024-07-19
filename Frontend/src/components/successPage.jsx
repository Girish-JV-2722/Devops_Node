import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const SuccessPage = () => {
  const [status, setStatus] = useState('in progress');
  const [publicIp, setPublicIp] = useState('');
  const [port, setPort] = useState(3000); // Default port, can be changed as needed
  const { projectId } = useParams();

  useEffect(() => {
    const fetchInstanceStatus = async () => {
      // try {
      //   const statusResponse = await axios.get('http://localhost:3000/aws/instanceStatus?projectId=${projectId}'); // Replace with actual API endpoint
      //   const instanceStatus = statusResponse.data.status;
        
      //   if (instanceStatus === 'running') {
      //     const ipResponse = await axios.get('http://localhost:3000/aws/instancePublicIp?projectId=${projectId}'); // Replace with actual API endpoint
      //     setPublicIp(ipResponse.data.publicIp);
      //     setStatus('running');
      //   } else {
      //     setStatus('in progress');
      //   }
      // } catch (err) {
      //   console.error('Error fetching instance status:', err);
      //   setStatus('error');
      // }

      // Mock response
      setTimeout(() => {
        const instanceStatus = 'running'; // Simulated status

        if (instanceStatus === 'running') {
          setTimeout(() => {
            const publicIpAddress = '1.2.3.4'; // Simulated public IP
            setPublicIp(publicIpAddress);
            setStatus('running');
          }, 1000); // Simulate network delay for getting public IP
        } else {
          setStatus('in progress');
        }
      }, 1000); // Simulate network delay for getting instance status
    };

    const intervalId = setInterval(() => {
      fetchInstanceStatus();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-200">
      <div className="bg-white shadow-lg rounded-lg p-8 my-8 w-full max-w-lg">
      {status === 'running' ? (
        <div>
          <p>Your application has been successfully deployed and can be accessed using the link below:</p>
          <a
            href={`http://${publicIp}:${port}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            To access your application, click here.
          </a>
        </div>
      ) : status === 'error' ? (
        <p className="text-red-500">Error fetching instance status. Please try again later.</p>
      ) : (
        <p className="text-gray-600">Deployment in progress, please wait...</p>
      )}
      </div>
    </div>
  );
};

export default SuccessPage;
