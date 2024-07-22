import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTable } from 'react-table';
import axios from 'axios';

function HomePage() {
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
          { projectId: "11", projectName: "Project K" },
          { projectId: "222", projectName: "Project 2" },
          { projectId: "3", projectName: "Project 3" },
        ]);
        
        setLoading(false);
        console.log(projects);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleAddProject = () => {
    navigate('/add-project');
  };
  const handleDeployments = () => {
    navigate('/deployments');
  };

  const handleConfigure = (projectId) => {
    // console.log(projectId)
    navigate(`/configure/${projectId}`);
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
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: projects, // No need to memoize `data`
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
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <div className='flex justify-between items-center'>
          <button
            onClick={handleAddProject}
            className="inline-block bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition duration-300 mr-5"
          >
            Add Project
          </button>
          <button
            onClick={handleDeployments}
            className="inline-block bg-yellow-400 text-white py-2 px-4 rounded-lg shadow hover:bg-yellow-500 transition duration-300"
          >
            Deployments
          </button>
          </div>
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
    </div>
  );
}

export default HomePage;
