import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTable } from 'react-table';
import axios from 'axios';
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
        //const response = await axios.get(`${API_URL}/getAllApp`);

        // Combine applications and projects data
        const combinedData = response.data.projects.map(project => {
          const application = response.data.applications.find(app => app.projectId === project.projectId);
          return {
            projectId: project.projectId,
            projectName: project.projectName,
            status: application ? application.status : false,
            publicIp: application ? response.data.deploydata.publicIp : null,
            portNumber: application ? response.data.deploydata.port : null
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

  const handleTerminateInstance = async (projectId) => {
    try {
      // Simulated delay to mimic an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // console.log(projectId);

      // Mock response
      const mockResponse = {
        data: {
          success: true, // Change to false to simulate a failed termination
        }
      };

      const response = mockResponse;

      if (response.data.success) {
        toast("Instance terminated successfully");
        // Remove the project from the table after successful termination
        setProjects((prevProjects) => prevProjects.filter(project => project.projectId !== projectId));
      } else {
        toast("Failed to terminate instance");
      }
    } catch (error) {
      toast("Error terminating instance");
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
          row.original.status ? (
            <button
              onClick={() => handleAccessLink(`http://${row.original.publicIp}:${row.original.portNumber}`)}
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
          row.original.status ? (
            <button
              onClick={() => handleTerminateInstance(row.original.projectId)}
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
