import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTable } from 'react-table';
import axios from 'axios';
import {API_URL}from '../constants/api.js'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function DeploymentsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // const response = await axios.get(`${API_URL}/getAllApp`);
        // console.log(response.data);
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
                    "applicationId": 5,
                    "userId": 90469953,
                    "region": "us-east-1",
                    "environment": null,
                    "gitUrl": null,
                    "scripts": null,
                    "nodeVersion": null,
                    "projectId": 12,
                    "status": false,
                    "ipAddress": null,
                    "port": null,
                    "backendInstanceId": null,
                    "frontendInstanceId": "i-056a21b707a3372a2",
                    "createdAt": "2024-07-27T12:34:56.000Z",
                    "updatedAt": "2024-07-27T12:34:56.000Z"
                },
                {
                    "applicationId": 123,
                    "userId": 90469953,
                    "region": "us-east-1",
                    "environment": "EC2",
                    "gitUrl": null,
                    "scripts": null,
                    "nodeVersion": "14",
                    "projectId": 13,
                    "status": true,
                    "ipAddress": null,
                    "port": 3000,
                    "backendInstanceId": null,
                    "frontendInstanceId": null,
                    "createdAt": "2024-07-28T18:05:17.000Z",
                    "updatedAt": "2024-07-28T18:05:17.000Z"
                },
                {
                    "applicationId": 124,
                    "userId": 90469953,
                    "region": "us-east-1",
                    "environment": "EC2",
                    "gitUrl": null,
                    "scripts": null,
                    "nodeVersion": "14",
                    "projectId": 13,
                    "status": true,
                    "ipAddress": "18.234.120.32",
                    "port": 3000,
                    "backendInstanceId": null,
                    "frontendInstanceId": null,
                    "createdAt": "2024-07-28T18:54:57.000Z",
                    "updatedAt": "2024-07-28T18:54:57.000Z"
                },
                {
                    "applicationId": 125,
                    "userId": 90469953,
                    "region": "us-east-1",
                    "environment": "EC2",
                    "gitUrl": null,
                    "scripts": null,
                    "nodeVersion": "14",
                    "projectId": 13,
                    "status": true,
                    "ipAddress": "98.80.227.17",
                    "port": 3000,
                    "backendInstanceId": null,
                    "frontendInstanceId": null,
                    "createdAt": "2024-07-28T19:05:49.000Z",
                    "updatedAt": "2024-07-28T19:05:49.000Z"
                },
                {
                    "applicationId": 126,
                    "userId": 90469953,
                    "region": "us-east-1",
                    "environment": "EC2",
                    "gitUrl": null,
                    "scripts": null,
                    "nodeVersion": "14",
                    "projectId": 13,
                    "status": true,
                    "ipAddress": null,
                    "port": 3000,
                    "backendInstanceId": null,
                    "frontendInstanceId": null,
                    "createdAt": "2024-07-28T19:15:26.000Z",
                    "updatedAt": "2024-07-28T19:15:26.000Z"
                },
                {
                    "applicationId": 127,
                    "userId": 90469953,
                    "region": "us-east-1",
                    "environment": "EC2",
                    "gitUrl": null,
                    "scripts": null,
                    "nodeVersion": "14",
                    "projectId": 14,
                    "status": true,
                    "ipAddress": "18.234.73.206",
                    "port": 3000,
                    "backendInstanceId": null,
                    "frontendInstanceId": null,
                    "createdAt": "2024-07-29T04:37:42.000Z",
                    "updatedAt": "2024-07-29T04:37:42.000Z"
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
                    "status": true,
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
                    "status": true,
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

        // Combine applications and projects data
        const combinedData = response.data.projects.map(project => {
          const application = response.data.applications.find(app => app.projectId === project.projectId);
          return {
            projectId: project.projectId,
            projectName: project.projectName,
            status: application ? application.status : false,
            publicIp: application ? application.ipAddress: null,
            frontendInstanceId : application ? application.frontendInstanceId : null,
            backendInstanceId : application ? application.backendInstanceId : null,
          };
        });

        setProjects(combinedData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    console.log(projects);
  }, [projects]);

  const handleTerminateInstance = async (frontendInstanceId,backendInstanceId) => {
    try {
      // console.log(frontendInstanceId,backendInstanceId);
      const response = await axios.post(`${API_URL}/terminateInstance?frontendInstanceId=${frontendInstanceId}&backendInstanceId=${backendInstanceId}`);


      // Mock response
      // const response = mockResponse;
      // const response = {
      //   data: { success: true }
      // }
      if (response.data) {
        // console.log(response.data);
        toast("Instance terminated successfully");
        // Remove the project from the table after successful termination
        setProjects((prevProjects) => prevProjects.filter(project => project.frontendInstanceId !== frontendInstanceId));
      } else {
        toast("Failed to terminate instance");
      }
    } catch (error) {
      toast("Error terminating instance");
    }
  };

  const handleStartInstance = async (frontendInstanceId, backendInstanceId) => {
    try {
      const response = await axios.get(`${API_URL}/startInstance?frontendInstanceId=${frontendInstanceId}&backendInstanceId=${backendInstanceId}`);
      if (response.data) {
        toast("Instance started successfully");
        setProjects((prevProjects) => prevProjects.map(project =>
          project.frontendInstanceId === frontendInstanceId || project.backendInstanceId === backendInstanceId
            ? { ...project, status: true }
            : project
        ));
      } else {
        toast("Failed to start instance");
      }
    } catch (error) {
      toast("Error starting instance");
    }
  };

  const handleStopInstance = async (frontendInstanceId, backendInstanceId) => {
    try {
      const response = await axios.get(`${API_URL}/stopInstance?frontendInstanceId=${frontendInstanceId}&backendInstanceId=${backendInstanceId}`);
      if (response.data) {
        toast("Instance stopped successfully");
        setProjects((prevProjects) => prevProjects.map(project =>
          project.frontendInstanceId === frontendInstanceId || project.backendInstanceId === backendInstanceId
            ? { ...project, status: false }
            : project
        ));
      } else {
        toast("Failed to stop instance");
      }
    } catch (error) {
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
        Cell: ({ value }) => (
          <span className={`flex items-center justify-center w-36 text-white h-8 py-1 px-2 rounded-lg ${value ? 'bg-green-600' : 'bg-red-600'}`}>
            {value ? 'successfully deployed' : 'failed to deploy'}
          </span>
        ),
        className: 'text-center',
      },
      {
        Header: 'Access',
        accessor: 'access',
        Cell: ({ row }) => (
          <button
            onClick={() => handleAccessLink(`http://${row.original.publicIp}`)}
            className={`bg-blue-500 text-white py-1 px-2 rounded-lg shadow ${row.original.status ? 'hover:bg-blue-600' : 'opacity-50 cursor-not-allowed'}`}
            disabled={!row.original.status}
          >
            Link
          </button>
        ),
        className: 'text-center',
      },
      {
        Header: 'Terminate EC2 Instance',
        accessor: 'terminate',
        Cell: ({ row }) => (
          <button
            onClick={() => handleTerminateInstance(row.original.frontendInstanceId, row.original.backendInstanceId)}
            className={`bg-red-500 text-white py-1 px-2 rounded-lg shadow ${row.original.status ? 'hover:bg-red-600' : 'opacity-50 cursor-not-allowed'}`}
            disabled={!row.original.status}
          >
            Terminate
          </button>
        ),
        className: 'text-center',
      },
      {
        Header: 'Manage EC2 Instance',
        accessor: 'manage',
        Cell: ({ row }) => (
          <div className="flex justify-center gap-2">
            {row.original.status ? (
              <>
                <button
                  onClick={() => handleStopInstance(row.original.frontendInstanceId, row.original.backendInstanceId)}
                  className="bg-yellow-500 text-white py-1 px-2 rounded-lg shadow hover:bg-yellow-600"
                >
                  Stop
                </button>
              </>
            ) : (
              <button
                onClick={() => handleStartInstance(row.original.frontendInstanceId, row.original.backendInstanceId)}
                className="bg-green-500 text-white py-1 px-2 rounded-lg shadow hover:bg-green-600"
              >
                Start
              </button>
            )}
          </div>
        ),
        className: 'text-center',
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: projects,
  });

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center bg-gray-200">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex justify-center items-center bg-gray-200">{error}</div>;
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-200 py-8">
      <div className="w-[60%] mx-[20%] px-4 py-8 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Deployments Table</h1>
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