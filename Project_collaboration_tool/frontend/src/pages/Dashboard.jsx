import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [createTeamData, setCreateTeamData] = useState({ name: "", description: "" });
  const [joinTeamData, setJoinTeamData] = useState({ teamId: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // check if logged in and fetch teams
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) {
      navigate("/login");
    } else {
      setUser(JSON.parse(storedUser));
      fetchTeams();
    }
  }, [navigate]);

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/teams", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/teams", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(createTeamData)
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to create team");
      } else {
        setSuccess("Team created successfully!");
        setCreateTeamData({ name: "", description: "" });
        setShowCreateModal(false);
        fetchTeams();
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/teams/join", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ teamId: joinTeamData.teamId })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to join team");
      } else {
        setSuccess("Successfully joined team!");
        setJoinTeamData({ teamId: "" });
        setShowJoinModal(false);
        fetchTeams();
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const isManager = user?.role === "project_manager" || user?.role === "admin";

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h2 className="logo">Project Collaboration Tool</h2>
        <div className="nav-links">
          <button className="home-btn" onClick={() => navigate("/")}>
            Home
          </button>
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
        <h1>Welcome, {user?.name} 👋</h1>
        <p>Manage your teams, projects, and tasks in one place.</p>
        {user?.role && (
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            Role: {user.role.replace('_', ' ').toUpperCase()}
          </p>
        )}
      </header>

      {error && <div style={{ padding: "10px", margin: "10px", background: "#fee", color: "#c00", borderRadius: "4px" }}>{error}</div>}
      {success && <div style={{ padding: "10px", margin: "10px", background: "#efe", color: "#0c0", borderRadius: "4px" }}>{success}</div>}

      <section className="dashboard-actions">
        {isManager && (
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            + Create Team
          </button>
        )}
        <button className="btn-primary" onClick={() => setShowJoinModal(true)}>
          + Join Team
        </button>
        <button className="btn-primary">+ Create Project</button>
      </section>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Team</h2>
            <form onSubmit={handleCreateTeam}>
              <div className="form-group">
                <label>Team Name *</label>
                <input
                  type="text"
                  value={createTeamData.name}
                  onChange={(e) => setCreateTeamData({ ...createTeamData, name: e.target.value })}
                  required
                  placeholder="Enter team name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={createTeamData.description}
                  onChange={(e) => setCreateTeamData({ ...createTeamData, description: e.target.value })}
                  placeholder="Enter team description (optional)"
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Team Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Join Team</h2>
            <form onSubmit={handleJoinTeam}>
              <div className="form-group">
                <label>Team ID *</label>
                <input
                  type="text"
                  value={joinTeamData.teamId}
                  onChange={(e) => setJoinTeamData({ ...joinTeamData, teamId: e.target.value })}
                  required
                  placeholder="Enter team ID"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowJoinModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? "Joining..." : "Join Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="dashboard-content">
        <h2>Your Teams & Projects</h2>
        <div className="projects-grid">
          {teams.length === 0 ? (
            <p>No teams yet. {isManager ? "Create a team" : "Join a team"} to get started!</p>
          ) : (
            teams.map((team) => (
              <div key={team.id} className="project-card">
                <h3>{team.name}</h3>
                {team.description && <p>{team.description}</p>}
                <p style={{ fontSize: "0.9rem", color: "#666" }}>
                  Manager: {team.manager?.name || "N/A"}
                </p>
                {team.TeamMembers && team.TeamMembers.length > 0 && (
                  <p style={{ fontSize: "0.85rem", color: "#888" }}>
                    Members: {team.TeamMembers.length}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;