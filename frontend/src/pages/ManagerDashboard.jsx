import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Dashboard.css";

const emptyMember = { name: "", email: "", mobile: "", roleInTeam: "" };

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [activeTeams, setActiveTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [projectForm, setProjectForm] = useState({ name: "", description: "", teamId: "" });
  const [teamForm, setTeamForm] = useState({ name: "", members: [{ ...emptyMember }] });
  const token = localStorage.getItem("token");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(storedUser);
    if (parsed.role !== "project_manager") {
      navigate("/");
      return;
    }
    setUser(parsed);
  }, [navigate]);

  const fetchAllTeams = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/manager/teams", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTeams(data.teams || []);
    } catch {}
  };

  const fetchActiveTeams = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/manager/teams-with-projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load teams");
      } else {
        setActiveTeams(data.teams || []);
      }
    } catch (e) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTeams();
    fetchActiveTeams();
  }, [token]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError("");
    if (!projectForm.name || !projectForm.teamId) {
      setError("Project name and team are required");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/manager/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to create project");
      } else {
        setProjectForm({ name: "", description: "", teamId: "" });
        fetchActiveTeams();
      }
    } catch (e) {
      setError("Server error");
    }
  };

  const handleAddMemberRow = () => {
    setTeamForm({ ...teamForm, members: [...teamForm.members, { ...emptyMember }] });
  };

  const handleRemoveMemberRow = (idx) => {
    const updated = teamForm.members.filter((_, i) => i !== idx);
    setTeamForm({ ...teamForm, members: updated.length ? updated : [{ ...emptyMember }] });
  };

  const handleMemberChange = (idx, field, value) => {
    const updated = teamForm.members.map((m, i) => (i === idx ? { ...m, [field]: value } : m));
    setTeamForm({ ...teamForm, members: updated });
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setError("");
    if (!teamForm.name) {
      setError("Team name is required");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/manager/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(teamForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to create team");
      } else {
        setTeamForm({ name: "", members: [{ ...emptyMember }] });
        fetchAllTeams();
        fetchActiveTeams();
      }
    } catch (e) {
      setError("Server error");
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h2 className="logo">Manager Console</h2>
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
        <h1>Welcome, {user?.name}</h1>
        <p>Plan projects, assign tasks, and manage your team.</p>
      </header>

      <section className="dashboard-content">
        <h2>Create Team</h2>
        {error && <p style={{ color: "#d33" }}>{error}</p>}
        <form onSubmit={handleCreateTeam} className="login-form" style={{ maxWidth: 720 }}>
          <div className="login-field">
            <label>Team Name</label>
            <input
              type="text"
              value={teamForm.name}
              onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
              placeholder="Enter team name"
              required
            />
          </div>

          <div className="login-field">
            <label>Members</label>
            {teamForm.members.map((m, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder="Full name"
                  value={m.name}
                  onChange={(e) => handleMemberChange(idx, "name", e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={m.email}
                  onChange={(e) => handleMemberChange(idx, "email", e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Mobile"
                  value={m.mobile}
                  onChange={(e) => handleMemberChange(idx, "mobile", e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Role in team (optional)"
                  value={m.roleInTeam}
                  onChange={(e) => handleMemberChange(idx, "roleInTeam", e.target.value)}
                />
                <button type="button" className="btn-primary" onClick={() => handleRemoveMemberRow(idx)}>Remove</button>
              </div>
            ))}
            <button type="button" className="btn-primary" onClick={handleAddMemberRow}>+ Add Member</button>
          </div>

          <button type="submit" className="login-button">Create Team</button>
        </form>
      </section>

      <section className="dashboard-content">
        <h2>Create New Project</h2>
        {error && <p style={{ color: "#d33" }}>{error}</p>}
        <form onSubmit={handleCreateProject} className="login-form" style={{ maxWidth: 520 }}>
          <div className="login-field">
            <label>Project Name</label>
            <input
              type="text"
              value={projectForm.name}
              onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
              placeholder="Enter project name"
              required
            />
          </div>
          <div className="login-field">
            <label>Description</label>
            <input
              type="text"
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              placeholder="Short description (optional)"
            />
          </div>
          <div className="login-field">
            <label>Team</label>
            <select
              value={projectForm.teamId}
              onChange={(e) => setProjectForm({ ...projectForm, teamId: e.target.value })}
              required
            >
              <option value="">Select a team</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="login-button">Create Project</button>
        </form>
      </section>

      <section className="dashboard-content">
        <h2>Your Active Teams & Projects</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="projects-grid">
            {activeTeams.length === 0 ? (
              <div className="project-card">
                <h3>No active teams</h3>
                <p>Create a project to get started.</p>
              </div>
            ) : (
              activeTeams.map((team) => (
                <div key={team.id} className="project-card">
                  <h3>{team.name}</h3>
                  <ul style={{ marginTop: 8 }}>
                    {team.projects?.map((p) => (
                      <li key={p.id}>
                        <strong>{p.name}</strong> — {p.status}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ManagerDashboard; 