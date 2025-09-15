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
  const [pending, setPending] = useState([]);
  const [acting, setActing] = useState({});
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

  const fetchPending = async () => {
    if (!token) return;
    const res = await fetch("http://localhost:5000/api/teams/requests/pending", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) setPending(data.requests || []);
  };

  useEffect(() => {
    fetchAllTeams();
    fetchActiveTeams();
    fetchPending();
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
        if (data.project?.id) {
          navigate(`/project/${data.project.id}`);
        }
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

  const actOnRequest = async (requestId, action) => {
    setActing((a) => ({ ...a, [requestId]: true }));
    try {
      const res = await fetch(`http://localhost:5000/api/teams/requests/${requestId}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) alert(data.message || "Action failed");
      await fetchPending();
    } finally {
      setActing((a) => ({ ...a, [requestId]: false }));
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {user?.name}</h1>
        <p>Plan projects, assign tasks, and manage your team.</p>
      </header>

      <section className="dashboard-content">
        <div className="form-card">
          <div className="form-header">
            <div className="form-title">Create Team</div>
            <div className="form-subtitle">Add members by name, email and mobile</div>
          </div>
          {error && <p style={{ color: "#d33" }}>{error}</p>}
          <form onSubmit={handleCreateTeam} style={{ maxWidth: 960 }}>
            <div>
              <label className="label">Team Name</label>
              <input
                className="input"
                type="text"
                value={teamForm.name}
                onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                placeholder="Enter team name"
                required
              />
              <p className="helper">E.g. Frontend Squad, Mobile Team</p>
            </div>

            <div style={{ marginTop: 16 }}>
              <label className="label">Members</label>
              {teamForm.members.map((m, idx) => (
                <div key={idx} className="form-row" style={{ marginBottom: 8 }}>
                  <input
                    className="input"
                    type="text"
                    placeholder="Full name"
                    value={m.name}
                    onChange={(e) => handleMemberChange(idx, "name", e.target.value)}
                    required
                  />
                  <input
                    className="input"
                    type="email"
                    placeholder="Email"
                    value={m.email}
                    onChange={(e) => handleMemberChange(idx, "email", e.target.value)}
                    required
                  />
                  <input
                    className="input"
                    type="text"
                    placeholder="Mobile"
                    value={m.mobile}
                    onChange={(e) => handleMemberChange(idx, "mobile", e.target.value)}
                    required
                  />
                  <input
                    className="input"
                    type="text"
                    placeholder="Role in team (optional)"
                    value={m.roleInTeam}
                    onChange={(e) => handleMemberChange(idx, "roleInTeam", e.target.value)}
                  />
                  <button type="button" className="btn-danger" onClick={() => handleRemoveMemberRow(idx)}>Remove</button>
                </div>
              ))}
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleAddMemberRow}>+ Add Member</button>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Create Team</button>
            </div>
          </form>
        </div>
      </section>

      <section className="dashboard-content">
        <div className="form-card">
          <div className="form-header">
            <div className="form-title">Create Project</div>
            <div className="form-subtitle">Assign the project to one of your teams</div>
          </div>
          {error && <p style={{ color: "#d33" }}>{error}</p>}
          <form onSubmit={handleCreateProject} style={{ maxWidth: 720 }}>
            <div className="form-grid">
              <div>
                <label className="label">Project Name</label>
                <input
                  className="input"
                  type="text"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div>
                <label className="label">Team</label>
                <select
                  className="select"
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
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="label">Description</label>
              <input
                className="input"
                type="text"
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                placeholder="Short description (optional)"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Create Project</button>
            </div>
          </form>
        </div>
      </section>

      <section className="dashboard-content">
        <h2>Pending Join Requests</h2>
        <div className="projects-grid">
          {pending.length === 0 ? (
            <div className="project-card"><p>No pending requests</p></div>
          ) : (
            pending.map((r) => (
              <div key={r.id} className="project-card">
                <h3>{r.team?.name}</h3>
                <p className="helper">{r.requester?.name} ({r.requester?.email}) wants to join</p>
                <div className="form-actions">
                  <button className="btn-primary" disabled={acting[r.id]} onClick={() => actOnRequest(r.id, 'approve')}>{acting[r.id] ? '...' : 'Approve'}</button>
                  <button className="btn-danger" disabled={acting[r.id]} onClick={() => actOnRequest(r.id, 'reject')}>{acting[r.id] ? '...' : 'Reject'}</button>
                </div>
              </div>
            ))
          )}
        </div>
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
                  <ul className="list" style={{ marginTop: 8 }}>
                    {team.projects?.map((p) => (
                      <li key={p.id} className="list-item">
                        <div>
                          <strong>{p.name}</strong>
                          <span style={{ marginLeft: 8 }} className={`badge ${p.status}`}>{p.status.replace('_', ' ')}</span>
                        </div>
                        <Link to={`/project/${p.id}`} className="btn-secondary">Open Board</Link>
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