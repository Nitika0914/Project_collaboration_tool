import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // check if logged in (you’ll use JWT or session later)
  useEffect(() => {
    const storedUser = localStorage.getItem("user"); // after login, save user here
    if (!storedUser) {
      navigate("/login"); // redirect if not logged in
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h2 className="logo">Project Collaboration Tool</h2>
        <div className="nav-links">
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <header className="dashboard-header">
        <h1>Welcome, {user?.name} 👋</h1>
        <p>Manage your teams, projects, and tasks in one place.</p>
      </header>

      <section className="dashboard-actions">
        <button className="btn-primary">+ Create Team</button>
        <button className="btn-primary">+ Join Team</button>
        <button className="btn-primary">+ Create Project</button>
      </section>

      <section className="dashboard-content">
        <h2>Your Teams & Projects</h2>
        <div className="projects-grid">
          {/* later map API data here */}
          <div className="project-card">
            <h3>Team Alpha</h3>
            <p>Project: Website Redesign</p>
          </div>
          <div className="project-card">
            <h3>Team Beta</h3>
            <p>Project: Mobile App</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;