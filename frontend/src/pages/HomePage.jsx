import React from "react";
import "./HomePage.css";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";

const HomePage = () => {
  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="container nav-inner">
          <h2 className="logo">Project Collaboration Tool</h2>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/login" className="signup-btn">Login</Link>
            <Link to="/signup" className="signup-btn">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero">
        <div className="container">
          <h1>Organize Your Teamwork Effortlessly</h1>
          <p>
            A modern collaboration platform to manage projects, assign tasks,
            track progress, and keep your team aligned — all in one place.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="btn-primary">Get Started</Link>
            <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/project" className="btn-primary">Task Management</Link>  {/* 👈 New button */}
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="features">
        <div className="container">
          <h2>Core Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span role="img" aria-label="lock">🔒</span>
              <h3>User Authentication</h3>
              <p>Secure sign-in with modern authentication features.</p>
            </div>
            <div className="feature-card">
              <span role="img" aria-label="team">👥</span>
              <h3>Teams & Projects</h3>
              <p>Create teams, assign tasks, and collaborate easily.</p>
            </div>
            <div className="feature-card">
              <span role="img" aria-label="check mark">✅</span>
              <h3>Task Tracking</h3>
              <p>Track progress and manage your tasks effortlessly.</p>
            </div>
            <div className="feature-card">
              <span role="img" aria-label="chat">💬</span>
              <h3>Real-time Chat</h3>
              <p>Communicate instantly with team members.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-layout">
          <div className="footer-about">
            <h3>Project Collaboration Tool</h3>
            <p>A modern platform to manage projects and teamwork easily.</p>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/login">Login</Link>
            
          </div>

          <div className="footer-contact">
            <h4>Contact</h4>
            <p>Email: support@pctool.com</p>
            <p>Phone: +91 98765 43210</p>
          </div>

          <div className="footer-socials">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a href="#"><FaFacebookF /></a>
              <a href="#"><FaTwitter /></a>
              <a href="#"><FaLinkedinIn /></a>
              <a href="#"><FaInstagram /></a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Project Collaboration Tool. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;