import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Dashboard.css";

const TeamMemberDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [discover, setDiscover] = useState([]);
  const [search, setSearch] = useState("");
  const [myTeams, setMyTeams] = useState([]);
  const [joining, setJoining] = useState({});
  const [requests, setRequests] = useState([]);

  const token = localStorage.getItem("token");

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

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    fetch("http://localhost:5000/api/projects", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load projects");
        setProjects(data.projects || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    fetch("http://localhost:5000/api/teams/mine", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setMyTeams(data.teams || []))
      .catch(() => {});

    fetch("http://localhost:5000/api/teams/requests/mine", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setRequests(data.requests || []))
      .catch(() => {});
  }, [token]);

  const discoverTeams = async (query) => {
    const trimmed = (query ?? search).trim();
    const url = trimmed ? `http://localhost:5000/api/teams?q=${encodeURIComponent(trimmed)}` : `http://localhost:5000/api/teams`;
    const res = await fetch(url);
    const data = await res.json();
    setDiscover(data.teams || []);
  };

  // Auto-load all teams on mount
  useEffect(() => {
    discoverTeams("");
  }, []);

  // Debounced search as user types
  useEffect(() => {
    const id = setTimeout(() => {
      discoverTeams(search);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  const requestJoin = async (teamId) => {
    setJoining((j) => ({ ...j, [teamId]: true }));
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${teamId}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) alert(data.message || "Failed to send request");
      else {
        // refresh my requests
        const r = await fetch("http://localhost:5000/api/teams/requests/mine", { headers: { Authorization: `Bearer ${token}` } });
        const rd = await r.json();
        setRequests(rd.requests || []);
      }
    } finally {
      setJoining((j) => ({ ...j, [teamId]: false }));
    }
  };

  const cancelRequest = async (teamId) => {
    setJoining((j) => ({ ...j, [teamId]: true }));
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${teamId}/join`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) alert(data.message || "Failed to cancel request");
      else {
        // refresh my requests
        const r = await fetch("http://localhost:5000/api/teams/requests/mine", { headers: { Authorization: `Bearer ${token}` } });
        const rd = await r.json();
        setRequests(rd.requests || []);
      }
    } finally {
      setJoining((j) => ({ ...j, [teamId]: false }));
    }
  };

  const statusByTeamId = requests.reduce((acc, r) => {
    acc[r.teamId] = r.status;
    return acc;
  }, {});

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Hi, {user?.name}</h1>
        <p>Join teams and work on projects.</p>
      </header>

      <section className="dashboard-content">
        <h2>Your Projects</h2>
        {error && <p style={{ color: "#d33" }}>{error}</p>}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="projects-grid">
            {projects.length === 0 ? (
              <div className="project-card">
                <h3>No projects yet</h3>
              </div>
            ) : (
              projects.map((p) => (
                <div key={p.id} className="project-card">
                  <h3>{p.name}</h3>
                  <p>{p.description || "No description"}</p>
                  <Link to={`/project/${p.id}`} className="btn-primary">Open Board</Link>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      <section className="dashboard-content">
        <div className="form-card">
          <div className="form-header">
            <div className="form-title">Discover Teams</div>
            <div className="form-subtitle">Search teams by name and send a join request</div>
          </div>
          <div className="form-grid">
            <input className="input" placeholder="Search team name..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="btn-primary" onClick={() => discoverTeams(search)}>Search</button>
          </div>
          <div style={{ marginTop: 12 }}>
            <div className="projects-grid">
              {discover.map((t) => {
                const status = statusByTeamId[t.id];
                const isPending = status === 'pending';
                const isApproved = status === 'approved';
                const isRejected = status === 'rejected';
                return (
                  <div key={t.id} className="project-card">
                    <h3>{t.name}</h3>
                    <p className="helper">Manager: {t.manager?.name || "Unknown"}</p>
                    {status && (
                      <span className={`badge ${status}`} style={{ marginBottom: 8, display: 'inline-block' }}>{status}</span>
                    )}
                    <div className="form-actions">
                      <button
                        className="btn-secondary"
                        disabled={joining[t.id] || isPending || isApproved}
                        onClick={() => requestJoin(t.id)}
                      >
                        {isPending ? 'Requested' : isApproved ? 'Joined' : joining[t.id] ? 'Sending...' : 'Request to Join'}
                      </button>
                      <button
                        className="btn-danger"
                        disabled={joining[t.id] || !isPending}
                        onClick={() => cancelRequest(t.id)}
                      >
                        Cancel Request
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-content">
        <h2>My Teams</h2>
        <div className="projects-grid">
          {myTeams.map((t) => (
            <div key={t.id} className="project-card">
              <h3>{t.name}</h3>
              <p className="helper">Team you are part of</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TeamMemberDashboard; 