// src/pages/ProjectPage.jsx
import React from "react";
import TaskBoard from "../components/TaskBoard";

const ProjectPage = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>📌 Project: Website Redesign</h2>
      <TaskBoard />
    </div>
  );
};

export default ProjectPage;