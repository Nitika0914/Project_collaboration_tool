import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Dashboard.css";

const TeamMemberDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(storedUser);
    if (parsed.role !== "team_member") {
      navigate("/");
      return;
    }
    setUser(parsed);
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h2 className="logo">My Workspace</h2>
        <div className="nav-links">
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <header className="dashboard-header">
        <h1>Hi, {user?.name}</h1>
        <p>View and update your assigned tasks.</p>
      </header>

      <section className="dashboard-actions">
        <button className="btn-primary">My Tasks</button>
        <button className="btn-primary">My Teams</button>
        <button className="btn-primary">Activity</button>
      </section>

      <section className="dashboard-content">
        <h2>Quick Access</h2>
        <div className="projects-grid">
          <div className="project-card">
            <h3>Today</h3>
            <p>See what’s due today.</p>
          </div>
          <div className="project-card">
            <h3>Upcoming</h3>
            <p>Prepare for upcoming tasks.</p>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <Link to="/project" className="btn-primary">Open Task Board</Link>
        </div>
      </section>
    </div>
  );
};

export default TeamMemberDashboard; 