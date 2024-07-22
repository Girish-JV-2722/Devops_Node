import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FormPage from './components/FormPage';
import HomePage from './components/HomePage';
import ProjectDetailsPage from './components/ProjectDetailsPage';
import './App.css';
import SuccessPage from './components/successPage';
import DeplymentsPage from './components/DeploymentsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add-project" element={<ProjectDetailsPage />} />
        <Route path="/deployments" element={<DeplymentsPage />} />
        <Route path="/configure/:projectId" element={<FormPage />} />
        <Route path="/configure/:projectId/success" element={<SuccessPage />} />
      </Routes>
    </Router>
  );
}

export default App;