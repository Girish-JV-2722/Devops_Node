import React from 'react';
import { useLocation } from "react-router-dom";

const SuccessPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const publicIp = searchParams.get("publicIp");
  const port = searchParams.get("port");

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-200">
      <div className="bg-white shadow-lg rounded-lg p-8 my-8 w-full max-w-lg">
      
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
    </div>
  );
};

export default SuccessPage;
