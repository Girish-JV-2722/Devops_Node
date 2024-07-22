import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTable } from 'react-table';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function DeplymentsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // const response = await axios.get('http://localhost:3000/project/getAllProjects');
        // setProjects(response.data);
        // setProjects([
        //   { projectId: "11", projectName: "Project K", status: "successfully deployed", url: "http://example.com/project-k" },
        //   { projectId: "222", projectName: "Project 2", status: "failed to deploy", url: "http://example.com/project-2" },
        //   { projectId: "3", projectName: "Project 3", status: "yet to configure", url: "http://example.com/project-3" },
        // ]);
        setProjects(
          [
            {
              "newDeployment": {
                "deploymentId": 76, "userId": 90469953, "applicationId": 94, "status": true, "log": "Something", "environment": "EC2",
                "createdAt": "2024-07-22T15:06:01.070Z", "updatedAt": "2024-07-22T15:06:01.071Z"
              },
              "deploydata": {
                "status": true, "publicIp": null, "port": 3000
              }
            },
            {
              "newDeployment": {
                "deploymentId": 77, "userId": 90469954, "applicationId": 95, "status": false, "log": "Error", "environment": "Lambda",
                "createdAt": "2024-07-23T16:07:02.072Z", "updatedAt": "2024-07-23T16:07:02.073Z"
              },
              "deploydata": {
                "status": false, "publicIp": "192.168.1.1", "port": 8080
              }
            },
            {
              "newDeployment": {
                "deploymentId": 78, "userId": 90469955, "applicationId": 96, "status": true, "log": "Success", "environment": "ECS",
                "createdAt": "2024-07-24T17:08:03.074Z", "updatedAt": "2024-07-24T17:08:03.075Z"
              },
              "deploydata": {
                "status": true, "publicIp": "192.168.1.2", "port": 9090
              }
            },
            {
              "newDeployment": {
                "deploymentId": 79, "userId": 90469956, "applicationId": 97, "status": false, "log": "Failed to start", "environment": "EC2",
                "createdAt": "2024-07-25T18:09:04.076Z", "updatedAt": "2024-07-25T18:09:04.077Z"
              },
              "deploydata": {
                "status": false, "publicIp": "192.168.1.3", "port": 7070
              }
            },
          ]
        )

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


  const handleTerminateInstance = async (projectId) => {
    // try {
    //     const response = await axios.post(`http://localhost:3000/aws/terminateInstance`, { projectId });
    //     if (response.data.success) {
    //         toast("Instance terminated successfully");
    //         // Optionally, update the project status to reflect the termination
    //         setProjects((prevProjects) => prevProjects.map(project => 
    //             project.projectId === projectId ? { ...project, status: 'terminated' } : project
    //         ));
    //     } else {
    //         toast("Failed to terminate instance");
    //     }
    // } catch (error) {
    //     toast("Error terminating instance");
    // }

    try {
      // Simulated delay to mimic an API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock response
      const mockResponse = {
        data: {
          success: true, // Change to false to simulate a failed termination
        }
      };

      // Use the mock response instead of the actual API call
      // const response = await axios.post(`http://localhost:3000/aws/terminateInstance`, { projectId });
      const response = mockResponse;

      if (response.data.success) {
        toast("Instance terminated successfully");
       // Remove the project from the table after successful termination
      setProjects((prevProjects) => prevProjects.filter(project => project.newDeployment.deploymentId !== projectId));
      } else {
        toast("Failed to terminate instance");
      }
    } catch (error) {
      toast("Error terminating instance");
    }
  };

  // const handleConfigure = (projectId) => {
  //   navigate(`/configure/${projectId}`);
  // };

  const handleAccessLink = (url) => {
    window.open(url, '_blank');
  };

  const columns = React.useMemo(
    () => [
      {
        // replace with name when backend team gives ProjectName in response
        Header: 'Project ID',
        accessor: 'newDeployment.deploymentId',
        className: 'text-gray-900 font-medium',
      },
      {
        Header: 'Status',
        accessor: 'newDeployment.status',
        Cell: ({ value }) => (
          <span className={`flex items-center justify-center w-36 text-white h-8 py-1 px-2 rounded-lg ${value ? 'bg-green-600' : 'bg-red-600'}`}>
            {value ? 'successfully deployed' : 'failed to deploy'}
          </span>
        ),
        className: 'text-center',
      },
      {
        Header: 'Access',
        accessor: 'deploydata.publicIp',
        Cell: ({ row }) => (
          row.original.newDeployment.status ? (
            <button
              onClick={() => handleAccessLink(`http://${row.original.deploydata.publicIp}:${row.original.deploydata.port}`)}
              className="bg-blue-500 text-white py-1 px-2 rounded-lg shadow hover:bg-blue-600 transition duration-300"
            >
              Link
            </button>
          ) : <span className='items-center justify-center py-1 px-5'>-</span>
        ),
        className: 'text-center',
      },
      {
        Header: 'Terminate EC2 Instance',
        accessor: 'terminate',
        Cell: ({ row }) => (
          row.original.newDeployment.status ? (
            <button
              onClick={() => handleTerminateInstance(row.original.newDeployment.deploymentId)}
              className="bg-red-500 text-white py-1 px-2 rounded-lg shadow hover:bg-red-600 transition duration-300"
            >
              Terminate
            </button>
          ) : <span className='items-center justify-center py-1 px-5'>-</span>
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
    <div className="min-h-screen flex justify-center items-center bg-gray-200">
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
                          key={`${row.id}-${cell.column.id}-${index}`} // Unique key for each cell
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

export default DeplymentsPage;



