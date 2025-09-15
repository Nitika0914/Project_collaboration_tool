// src/pages/ProjectPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const statusOrder = ["todo", "in_progress", "done"];

const ProjectPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const token = localStorage.getItem("token");
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [assign, setAssign] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const grouped = useMemo(() => {
    const by = { todo: [], in_progress: [], done: [] };
    tasks.forEach((t) => by[t.status].push(t));
    return by;
  }, [tasks]);

  const fetchProject = async () => {
    if (!projectId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load project");
        if (res.status === 401) navigate("/login");
      } else {
        setProject(data.project);
        setTasks((data.project?.tasks || []).sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)));
        setMembers(data.project?.team?.members || []);
      }
    } catch (e) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const createTask = async () => {
    if (!newTask.trim()) return;
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newTask, assignedTo: assign || undefined }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Failed to add task");
      setNewTask("");
      setAssign("");
      setTasks((cur) => [...cur, data.task]);
    } catch (e) {
      setError("Server error");
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Failed to update task");
      setTasks((cur) => cur.map((t) => (t.id === taskId ? data.task : t)));
    } catch (e) {
      setError("Server error");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Failed to delete task");
      setTasks((cur) => cur.filter((t) => t.id !== taskId));
    } catch (e) {
      setError("Server error");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: '#d33' }}>{error}</p>}
      {project && (
        <>
          <h2>📌 {project.name}</h2>
          <p style={{ color: '#6b7280' }}>{project.description || 'No description'}</p>

          <div className="project-card" style={{ margin: '16px 0' }}>
            <h3>Team Details</h3>
            <p className="helper">Team: {project.team?.name || 'N/A'}</p>
            <p className="helper">Manager: {project.team?.manager?.name} ({project.team?.manager?.email})</p>
            <div style={{ marginTop: 8 }}>
              <strong>Members</strong>
              <ul className="list" style={{ marginTop: 6 }}>
                {members.map((m) => (
                  <li key={m.id} className="list-item">
                    <span>{m.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ margin: '16px 0', display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Task title"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 6, flex: 1 }}
            />
            <select
              value={assign}
              onChange={(e) => setAssign(e.target.value)}
              style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}
            >
              <option value="">Assign (optional)</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <button onClick={createTask} className="btn-primary">+ Add Task</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {statusOrder.map((col) => (
              <div key={col} className="project-card">
                <h3 style={{ textTransform: 'capitalize' }}>{col.replace('_', ' ')}</h3>
                {(grouped[col] || []).map((t) => (
                  <div key={t.id} className="task-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, border: '1px solid #eee', borderRadius: 6, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.title}</div>
                      {t.assignedTo && (
                        <div className="helper">Assigned</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {statusOrder.filter((s) => s !== t.status).map((s) => (
                        <button key={s} className="btn-secondary" onClick={() => updateTask(t.id, { status: s })}>{s.replace('_', ' ')}</button>
                      ))}
                      <button className="btn-danger" onClick={() => deleteTask(t.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectPage;