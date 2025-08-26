import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import ProjectPage from './pages/ProjectPage';
const App = () => {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
       <Route path="/About" element={<About />} />
       <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/project" element={<ProjectPage/>} />

    </Routes>
    </Router>
  );
};

export default App