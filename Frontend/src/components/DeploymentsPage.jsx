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
        setProjects([
          { projectId: "11", projectName: "Project K", status: "successfully deployed", url: "http://example.com/project-k" },
          { projectId: "222", projectName: "Project 2", status: "failed to deploy", url: "http://example.com/project-2" },
          { projectId: "3", projectName: "Project 3", status: "yet to configure", url: "http://example.com/project-3" },
        ]);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

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
          // Optionally, update the project status to reflect the termination
          setProjects((prevProjects) => prevProjects.map(project => 
              project.projectId === projectId ? { ...project, status: 'terminated' } : project
          ));
      } else {
          toast("Failed to terminate instance");
      }
    } catch (error) {
        toast("Error terminating instance");
    }
  };

  const handleConfigure = (projectId) => {
    navigate(`/configure/${projectId}`);
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
        Header: 'Actions',
        accessor: 'projectId',
        Cell: ({ value }) => (
          <button
            onClick={() => handleConfigure(value)}
            className="bg-green-500 text-white py-1 px-2 rounded-lg shadow hover:bg-green-600 transition duration-300"
          >
            Configure
          </button>
        ),
        className: 'text-center',
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => (
          <span className={`flex items-center justify-center w-36 text-white h-8 py-1 px-2 rounded-lg ${value === 'successfully deployed' ? 'bg-green-600' : value === 'failed to deploy' ? 'bg-red-600' : 'bg-gray-600'}`}>
            {value}
          </span>
        ),
        className: 'text-center',
      },
      {
        Header: 'Access',
        accessor: 'url',
        Cell: ({ row }) => (
          row.original.status === 'successfully deployed' ? (
            <button
              onClick={() => handleAccessLink(row.original.url)}
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
            row.original.status === 'successfully deployed' ? (
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
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps()}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <td
                          {...cell.getCellProps()}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
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
