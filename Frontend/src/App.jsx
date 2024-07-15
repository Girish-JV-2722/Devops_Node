import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GithubPage from './components/GithubPage';
import FormPage from './components/FormPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GithubPage />} />
        <Route path="/form" element={<FormPage />} />
      </Routes>
    </Router>
  );
}

export default App;