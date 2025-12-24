import React, { useState } from "react";
import "./TaskBoard.css";

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  // Add a new task
  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask, status: "Pending" }]);
    setNewTask("");
  };

  // Remove a task
  const removeTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // Toggle done status
  const toggleDone = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, status: task.status === "Done" ? "Pending" : "Done" }
          : task
      )
    );
  };

  // Progress calculation
  const completed = tasks.filter((t) => t.status === "Done").length;
  const progress = tasks.length ? (completed / tasks.length) * 100 : 0;

  return (
    <div className="task-board-wrapper">
      <h2>📝 Task Board</h2>

      {tasks.length > 0 && (
        <div className="progress-wrapper">
          <div className="progress-text">
            {completed}/{tasks.length} tasks done
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="task-input">
        <input
          type="text"
          placeholder="Enter a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <button onClick={addTask}>+ Add</button>
      </div>

      <div className="task-list">
        {tasks.length === 0 ? (
          <p className="empty">No tasks yet. Add one!</p>
        ) : (
          tasks.map(({ id, text, status }) => (
            <div
              key={id}
              className={`task-card ${status === "Done" ? "done" : ""}`}
            >
              <span>{text}</span>
              <div className="btn-group">
                <button className="done-btn" onClick={() => toggleDone(id)}>
                  {status === "Done" ? "Undo" : "Done"}
                </button>
                <button className="delete-btn" onClick={() => removeTask(id)}>
                  ❌
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskBoard;