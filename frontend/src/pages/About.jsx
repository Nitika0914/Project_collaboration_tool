import React from "react";
import { Link } from "react-router-dom";
import "./About.css";

const AboutPage = () => {
  return (
    <div className="about-root">
      {/* Navbar */}
      <nav className="navbar">
        <div className="container nav-inner">
          <h2 className="logo">Project Collaboration Tool</h2>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/login" className="login-btn">Login</Link>
            <Link to="/signup" className="signup-btn">Sign Up</Link>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="about-main">
        <div className="container">
          <h1 className="about-title">About Project Collaboration Tool</h1>
          <p className="about-desc">
            Our mission is to simplify teamwork by providing a single platform to manage projects, assign tasks, and track progress effortlessly.
          </p>
          <div className="about-cards">
            <div className="about-card">
              <h3>🚀 <span className="about-blue">Our Mission</span></h3>
              <p>
                We aim to empower teams of all sizes to collaborate seamlessly, stay organized, and achieve their goals faster.
              </p>
            </div>
            <div className="about-card">
              <h3>🤝 <span className="about-blue">Why Choose Us?</span></h3>
              <p>
                Unlike traditional tools, we combine task management, team communication, and project tracking in one simple interface.
              </p>
            </div>
            <div className="about-card">
              <h3>🌍 <span className="about-blue">Our Vision</span></h3>
              <p>
                To become the go-to platform for collaboration, making teamwork stress-free across the globe.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;