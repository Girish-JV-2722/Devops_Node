import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTable } from 'react-table';
import axios from 'axios';
import { API_URL } from '../constants/api.js';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function DeploymentsPage() {
  const navigate = useNavigate();
  const [rerender, setRerender] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingforEC2, setLoadingforEC2] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // const response = await axios.get(`${API_URL}/getAllApp`);
          const response = {
              data : {
                "deploydata": {
                    "status": true,
                    "publicIp": "52.91.237.149",
                    "port": "3000",
                    "frontendInstanceId": "i-0e3de897255172c11",
                    "backendInstanceId": "i-0bdbd3e7e1a28b3d1"
                },
                "applications": [
                  {
                    "applicationId": 126,
                    "userId": 90469953,
                    "region": "us-east-1",
                    "environment": "EC2",
                    "gitUrl": null,
                    "scripts": null,
                    "nodeVersion": "14",
                    "projectId": 13,
                    "status": "deployed",
                    "ipAddress": null,
                    "port": 3000,
                    "backendInstanceId": null,
                    "frontendInstanceId": null,
                    "createdAt": "2024-07-28T19:15:26.000Z",
                    "updatedAt": "2024-07-28T19:15:26.000Z"
                },
                {
                    "applicationId": 128,
                    "userId": 90469953,
                    "region": "us-east-1",
                    "environment": "EC2",
                    "gitUrl": null,
                    "scripts": null,
                    "nodeVersion": "14",
                    "projectId": 15,
                    "status": "stopped",
                    "ipAddress": "34.230.51.28",
                    "port": 3000,
                    "backendInstanceId": null,
                    "frontendInstanceId": null,
                    "createdAt": "2024-07-29T05:04:03.000Z",
                    "updatedAt": "2024-07-29T05:04:03.000Z"
                },
                {
                    "applicationId": 131,
                    "userId": 90469953,
                    "region": "us-east-1",
                    "environment": "EC2",
                    "gitUrl": null,
                    "scripts": null,
                    "nodeVersion": "14",
                    "projectId": 16,
                    "status": "deployed",
                    "ipAddress": "52.91.237.149",
                    "port": 3000,
                    "backendInstanceId": "i-0bdbd3e7e1a28b3d1",
                    "frontendInstanceId": "i-0e3de897255172c11",
                    "createdAt": "2024-07-29T06:28:09.000Z",
                    "updatedAt": "2024-07-29T06:28:09.000Z"
                }
              ],
                "projects": [
                    {
                        "projectId": 11,
                        "projectName": "Backend",
                        "clientName": "DevOps Team",
                        "managerName": "Kiran sir",
                        "description": "node server",
                        "createdAt": "2024-07-23T18:25:56.000Z",
                        "updatedAt": "2024-07-23T18:25:56.000Z"
                    },
                    {
                        "projectId": 12,
                        "projectName": "codmey",
                        "clientName": "askn",
                        "managerName": "n skaj",
                        "description": "trregger",
                        "createdAt": "2024-07-26T14:07:02.000Z",
                        "updatedAt": "2024-07-26T14:07:02.000Z"
                    },
                    {
                        "projectId": 13,
                        "projectName": "Druva",
                        "clientName": "NASA",
                        "managerName": "Dave",
                        "description": "astronomy",
                        "createdAt": "2024-07-28T17:26:10.000Z",
                        "updatedAt": "2024-07-28T17:26:10.000Z"
                    },
                    {
                        "projectId": 14,
                        "projectName": "codmey5",
                        "clientName": "askn",
                        "managerName": "eggrre",
                        "description": "trregger",
                        "createdAt": "2024-07-29T04:33:26.000Z",
                        "updatedAt": "2024-07-29T04:33:26.000Z"
                    },
                    {
                        "projectId": 15,
                        "projectName": "nsknc",
                        "clientName": "dfb",
                        "managerName": "knlksd",
                        "description": "jnsan ",
                        "createdAt": "2024-07-29T05:00:07.000Z",
                        "updatedAt": "2024-07-29T05:00:07.000Z"
                    },
                    {
                        "projectId": 16,
                        "projectName": "project1",
                        "clientName": "client",
                        "managerName": "client2",
                        "description": "project2",
                        "createdAt": "2024-07-29T05:30:22.000Z",
                        "updatedAt": "2024-07-29T05:30:22.000Z"
                    }
                ]
            }
          }

        // Extract project IDs with associated applications
        const applicationProjectIds = new Set(response.data.applications.map(app => app.projectId));
        console.log(response.data);

        // Filter projects to include only those with associated applications
        const filteredProjects = response.data.projects.filter(project =>
          applicationProjectIds.has(project.projectId)
        );

        // Combine filtered projects with their associated applications data
        const combinedData = filteredProjects.map(project => {
          const app = response.data.applications.find(app => app.projectId === project.projectId);
          return {
            projectId: project.projectId,
            projectName: project.projectName,
            status: app ? app.status : "failed",
            publicIp: app ? app.ipAddress : null,
            frontendInstanceId: app ? app.frontendInstanceId : null,
            backendInstanceId: app ? app.backendInstanceId : null,
          };
        });
        console.log("Rendered");
        setProjects(combinedData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProjects();
  }, [rerender]);

  const handleTerminateInstance = async (frontendInstanceId, backendInstanceId) => {
    try {
      const response = await axios.get(`${API_URL}/terminateInstance?frontendInstanceId=${frontendInstanceId}&backendInstanceId=${backendInstanceId}`);
      
      if (response.data) {
        toast("Instance terminated successfully");
        setRerender(!rerender);
      } else {
        toast("Failed to terminate instance");
      }
    } catch (error) {
      toast("Error terminating instance");
    }
  };

  const handleStartInstance = async (frontendInstanceId, backendInstanceId) => {
    setLoadingforEC2(true);
    try {
      const response = await axios.get(`${API_URL}/startInstance?frontendInstanceId=${frontendInstanceId}&backendInstanceId=${backendInstanceId}`);
     
      if (response.data) {
        console.log(response.data); 
        toast("Instance started successfully");
        setLoadingforEC2(false);
        setRerender(!rerender);
      } else {
        setLoadingforEC2(false);
        setRerender(!rerender);
        toast("Failed to start instance");
      }
    } catch (err) {
      setLoadingforEC2(false);
      setRerender(!rerender);
      toast("Error starting instance");
    }
  };

  const handleStopInstance = async (frontendInstanceId, backendInstanceId) => {
    setLoadingforEC2(true);
    try {
      const response = await axios.get(`${API_URL}/stopInstance?frontendInstanceId=${frontendInstanceId}&backendInstanceId=${backendInstanceId}`);
    
      if (response.data) {
        toast("Instance stopped successfully");
        setLoadingforEC2(false);
        setRerender(!rerender);
      } else {
        setLoadingforEC2(false);
        setRerender(!rerender);
        console.log("Failed to stop instance"); 
        toast("Failed to stop instance");
      }
    } catch (error) {
      setLoadingforEC2(false);
      setRerender(!rerender);
      toast("Error stopping instance");
    }
  };

  const handleAccessLink = (url) => {
    window.open(url, '_blank');
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'Project Name',
        accessor: 'projectName',
        className: 'text-gray-900 font-medium',
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => {
          const statusColors = {
            deployed: 'bg-green-600',
            stopped: 'bg-yellow-600',
            failed: 'bg-red-600',
          };

          const bgColor = statusColors[value];

          return (
            <span className={`flex items-center justify-center w-36 text-white h-8 py-1 px-2 rounded-lg ${bgColor}`}>
              {value}
            </span>
          );
        },
        className: 'text-center',
      },
      {
        Header: 'Access',
        accessor: 'access',
        Cell: ({ row }) => (
          <button
            onClick={() => handleAccessLink(`http://${row.original.publicIp}`)}
            className={`bg-blue-500 text-white py-1 px-2 rounded-lg shadow ${row.original.status === 'deployed' ? 'hover:bg-blue-600' : 'opacity-50 cursor-not-allowed'}`}
            disabled={row.original.status !== 'deployed'}
          >
            Link
          </button>
        ),
        className: 'text-center',
      },
      {
        Header: 'Manage EC2 Instance',
        accessor: 'manage',
        Cell: ({ row }) => {
          const { status, frontendInstanceId, backendInstanceId } = row.original;
          return (
            <div className="flex justify-center gap-2">
              {status === 'deployed' && (
                <>
                  <button
                    onClick={() => handleStopInstance(frontendInstanceId, backendInstanceId)}
                    className="bg-yellow-500 text-white py-1 px-2 rounded-lg shadow hover:bg-yellow-600"
                  >
                    Stop
                  </button>
                  <button
                    onClick={() => handleTerminateInstance(frontendInstanceId, backendInstanceId)}
                    className="bg-red-500 text-white py-1 px-2 rounded-lg shadow hover:bg-red-600"
                  >
                    Terminate
                  </button>
                </>
              )}
              {status === 'stopped' && (
                <button
                  onClick={() => handleStartInstance(frontendInstanceId, backendInstanceId)}
                  className="bg-green-500 text-white py-1 px-2 rounded-lg shadow hover:bg-green-600"
                >
                  Start
                </button>
              )}
            </div>
          );
        },
        className: 'text-center',
      }
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data: projects });

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-200">
        <div className="bg-white p-6 rounded-lg shadow-lg w-80 h-40 flex items-center justify-center">
          Loading the deployments table...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-200">
        <div className="bg-white p-6 rounded-lg shadow-lg w-80 h-40 flex items-center justify-center">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-200 py-8">
      {loadingforEC2 && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
          <div className="flex flex-col items-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
            <div className="text-white text-xl font-semibold"> This may take a moment, please be patient.</div>
          </div>
        </div>
      )}
      <div className="w-[60%] mx-[20%] px-4 py-8 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Deployments Table</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600"
          >
            Home
          </button>
        </div>
        {projects.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No projects listed yet</p>
        ) : (
          <div className="overflow-hidden rounded-lg shadow">
            <table {...getTableProps()} className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps()}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        key={column.id}
                      >
                        {column.render('Header')}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
                {rows.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} key={row.id}>
                      {row.cells.map((cell, index) => (
                        <td
                          {...cell.getCellProps()}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          key={`${row.id}-${cell.column.id}-${index}`}
                        >
                          {cell.render('Cell')}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default DeploymentsPage;
