import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GithubPage from './components/GithubPage';
import FormPage from './components/FormPage';
import HomePage from './components/HomePage';
import ProjectDetailsPage from './components/ProjectDetailsPage';
import store from './store';
import { Provider } from 'react-redux';
import './App.css';

function App() {
  return (
    <Provider store={store}>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add-project" element={<ProjectDetailsPage />} />
        <Route path="/configure/:projectId" element={<GithubPage />} />
        <Route path="/configure/:projectId/form" element={<FormPage />} />
      </Routes>
    </Router>
    </Provider>
  );
}

export default App;