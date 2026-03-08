import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slidebar from "./Slidebar";
import "./Dashboardpage.css";

const BACKEND_URL = "http://127.0.0.1:8000";

const Dashboard = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [useremail, setUseremail] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user from Django session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me/`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Not authenticated");

        const data = await res.json();

        setUsername(data.name || "");
        setUseremail(data.email || "");
      } catch (err) {
        console.log("Auth error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/auth/logout/`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.log("Logout error:", err);
    }

    // Optional cleanup
    localStorage.removeItem("cyberguide_user_name");
    localStorage.removeItem("cyberguide_user_email");
    localStorage.removeItem("token");

    navigate("/login");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Slidebar onLogout={handleLogout} />

      <main className="dashboard-main">
        <header className="main-header">
          <div className="header-info">
            <h1>
              Operational <span className="highlight">Dashboard</span>
            </h1>
            <p>
              Welcome back, Agent{" "}
              {username ? username.split(" ")[0] : "User"}
            </p>
          </div>

          <div className="user-badge">
            <div className="avatar-circle">
              {username ? username.charAt(0).toUpperCase() : "U"}
            </div>

            <div className="badge-text">
              <span className="user-name">{username}</span>
              <span className="user-status">● Online</span>
            </div>
          </div>
        </header>

        <div className="dashboard-grid">
          <div className="stat-card profile-card">
            <h3>Identity Profile</h3>

            <div className="profile-details">
              <div className="detail-row">
                <span className="label">Full Name:</span>
                <span className="value">{username}</span>
              </div>

              <div className="detail-row">
                <span className="label">Email:</span>
                <span className="value">{useremail}</span>
              </div>

              <div className="detail-row">
                <span className="label">Clearance:</span>
                <span className="value accent">
                  Level 1 (Recruit)
                </span>
              </div>
            </div>
          </div>

          <div className="stat-card action-card">
            <h3>Active Missions</h3>

            <div className="mission-list">
              <div className="mission-item">
                <span className="m-name">SQL Injection Lab</span>
                <span className="status-tag ongoing">
                  In Progress
                </span>
              </div>

              <div className="mission-item">
                <span className="m-name">
                  Nmap Scanning Basics
                </span>
                <span className="status-tag locked">
                  Locked
                </span>
              </div>
            </div>

            <button
              className="launch-btn"
              onClick={() => navigate("/labs")}
            >
              Access Lab Environment
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;