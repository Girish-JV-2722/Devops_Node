import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { awsRegions } from "../constants/regions";
import { useNavigate, useParams } from "react-router-dom";

const TextInput = ({ name, value, onChange, placeholder, type = "text" }) => (
  <input
    type={type}
    name={name}
    value={value || ""}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
  />
);

const SelectInput = ({ name, value, onChange, options, placeholder }) => (
  <select
    name={name}
    value={value || ""}
    onChange={onChange}
    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
  >
    <option value="" disabled>
      {placeholder}
    </option>
    {options.map((option) => (
      <option key={option.code || option} value={option.code || option}>
        {option.name || option}
      </option>
    ))}
  </select>
);

export default function FormPage() {
  const [formData, setFormData] = useState({});
  const [isFetchingToken, setIsFetchingToken] = useState(false);
  const [rerender, setRerender] = useState(false);
  const [token,setToken]=useState(localStorage.getItem("accessToken"));

  const  { projectId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(projectId);
    // async function fetchData() {
    //   try {
    //     const response = await axios.get('http://localhost:3000/auth/github/gettoken',{withCredentials:true});
    //     console.log(response);
    //     if (response.data.accessToken) {
    //       setFormData((prevFormData) => ({
    //         ...prevFormData,
    //         githubAccessToken: response.data.accessToken
    //       }));
    //       console.log(response);
    //       toast("Successfully obtained GitHub access token");
    //     } else {
    //       toast("Failed to obtain GitHub access token");
    //     }
    //   } catch (error) {
    //     toast("Failed to obtain GitHub access token");
    //   }
    // }
    // fetchData();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const codeParams = urlParams.get("code");
    console.log(codeParams);

    if (codeParams && localStorage.getItem("accessToken") === null) {
      async function getAccessToken() {
        const response = await fetch("http://localhost:3000/getAccessToken?code=" + codeParams, {
          method: "GET",
        })
        const data = await response.json();
        console.log(data)
        if (data.access_token) {
          localStorage.setItem("accessToken", data.access_token);

          setFormData((prevFormData) => ({
            ...prevFormData,
            gitToken:token,
          }));
          console.log("successfully obtained token");
          toast.success("Successfully obtained GitHub access token");
          setRerender(!rerender);
        } else {
          
          toast.error("Failed to obtain GitHub access token");
          console.log("failed obtained token");
        }
        navigate("/");
      }
      getAccessToken();
    }
    else{
      console.log("Token already exists");
      setFormData((prevFormData) => ({
        ...prevFormData,
        gitToken:token,
      }));
    }
    // getUserData();
  }, []);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
    
  };
  
  const CLIENT_ID = "Ov23liBPsEnGO0AWvNx5";

  const handleGetGitHubToken = async () => {
    window.location.assign(
      "https://github.com/login/oauth/authorize?client_id=" + CLIENT_ID
    );
    // window.location.href="http://localhost:3000/auth/github/";
    navigate("/");
  };
  

  const handleSubmit = async (event) => {

    // return;
    
    event.preventDefault();

    console.log("Form Data:", formData);

    if (!formData) {
      toast("Form data is incomplete");
      return;
    }

    try {
      await fetch( `http://localhost:3000/configureApplication?projectId=${projectId}`, {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("accessToken"),
          'Content-Type': 'application/json',
        }, 
       body: JSON.stringify(formData),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          toast("Successfully sent data to server");
          console.log(data);
          navigate(`/configure/${projectId}/success`);
        });
    //   const response = await axios.post(
    //     "http://localhost:3000/configureApplication",
    //     {headers: {
    //       "Authorization": "Bearer " + localStorage.getItem("accessToken"),
    //     }
    //   },
    //     formData
    //   );
    //   if (response.data) {
    //     toast("Successfully sent data to server");
    //   } else {
    //     toast("Failed to send data to server");
    //   }
    //   toast("Successfully deployed application");
    } catch (error) {
      toast("Oops! Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="bg-white p-8 my-8 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">
          Deploy App on AWS
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4">
            <TextInput
              name="gitToken"
              value={token}
              onChange={(e) => {
                handleOnChange(e);
                setToken(localStorage.getItem("accessToken"));
              }}
              placeholder="GitHub Access Key"
              type="password"
            />
            <button
              type="button"
              onClick={handleGetGitHubToken}
              className={`bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition duration-300 ${
                isFetchingToken ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isFetchingToken}
            >
              Get Git Token
            </button>
          </div>
          <TextInput
            name="AWS_Accesskey"
            value={formData?.AWS_Accesskey}
            onChange={handleOnChange}
            placeholder="AWS Access Key"
          />
          <TextInput
            name="AWS_Secretkey"
            value={formData?.AWS_Secretkey}
            onChange={handleOnChange}
            placeholder="AWS Secret Key"
          />
          <SelectInput
            name="region"
            value={formData?.region}
            onChange={handleOnChange}
            options={awsRegions}
            placeholder="Select AWS Region"
          />
          <SelectInput
            name="environment"
            value={formData?.environment}
            onChange={handleOnChange}
            options={["EC2", "Elastic Beanstalk"]}
            placeholder="Select Deployment Environment"
          />
          <TextInput
            name="dockerUsername"
            value={formData?.dockerUsername}
            onChange={handleOnChange}
            placeholder="Docker Hub Username"
          />
          <TextInput
            name="dockerPassword"
            value={formData?.dockerPassword}
            onChange={handleOnChange}
            placeholder="Docker Hub Password"
            type="password"
          />
          {/* <SelectInput
            name="technology"
            value={formData?.technology}
            onChange={handleOnChange}
            options={["React", "Node"]}
            placeholder="Select Technology"
          /> */}
          {/* {formData?.technology === "React" && (
            <>
              <TextInput
                name="reactVersion"
                value={formData.reactVersion || ""}
                onChange={handleOnChange}
                placeholder="React Version"
              />
            </>
          )} */}
          <TextInput
            name="portNumber"
            value={formData.portNumber || ""}
            onChange={handleOnChange}
            placeholder="Backend Port Number"
          />
          <TextInput
            name="runCommand"
            value={formData?.runCommand}
            onChange={handleOnChange}
            placeholder="App Run Command"
          />
          <TextInput
            name="buildCommand"
            value={formData?.buildCommand}
            onChange={handleOnChange}
            placeholder="App Build Command"
          />
          <TextInput
            name="frontendRepoUrl"
            value={formData?.frontendRepoUrl}
            onChange={handleOnChange}
            placeholder="Frontend GitHub Repository"
          />
           <TextInput
            name="frontendNodeVersion"
            value={formData?.frontendNodeVersion}
            onChange={handleOnChange}
            placeholder="Frontend Node Version"
          />
          <TextInput
            name="backendRepoUrl"
            value={formData?.backendRepoUrl}
            onChange={handleOnChange}
            placeholder="Backend GitHub Repository"
          />
           <TextInput
            name="nodeVersion"
            value={formData?.nodeVersion}
            onChange={handleOnChange}
            placeholder="Backend Node Version"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Deploy
          </button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}
