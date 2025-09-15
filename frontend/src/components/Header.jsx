import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    setUser(stored ? JSON.parse(stored) : null);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <h2 className="logo">Project Collaboration Tool</h2>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          {!user ? (
            <>
              <Link to="/login" className="signup-btn">Login</Link>
              <Link to="/signup" className="signup-btn">Sign Up</Link>
            </>
          ) : (
            <>
              {user.role === "project_manager" && (
                <Link to="/manager" className="signup-btn">Manager</Link>
              )}
              {user.role === "team_member" && (
                <Link to="/member" className="signup-btn">My Workspace</Link>
              )}
              {user.role === "admin" && (
                <Link to="/dashboard" className="signup-btn">Dashboard</Link>
              )}
              <button className="signup-btn" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header; 