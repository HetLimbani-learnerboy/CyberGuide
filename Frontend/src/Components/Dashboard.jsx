import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slidebar from "./Slidebar";
import "./Dashboardpage.css";

const Dashboard = ({ isAuthenticated }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [useremail, setUseremail] = useState("");
    useEffect(() => {
        const name = localStorage.getItem("cyberguide_user_name");
        const email = localStorage.getItem("cyberguide_user_email");
        
        setUseremail(email || "")
        setUsername(name || "");
    }, [navigate, isAuthenticated]);

    const handleLogout = () => {
        localStorage.removeItem("cyberguide_user_name");
        localStorage.removeItem("cyberguide_user_email");
        localStorage.removeItem("token");
        navigate("/login");
        window.location.reload(); 
    };

    return (
        <div className="dashboard-wrapper">
            <Slidebar onLogout={handleLogout} />
            <main className="dashboard-main">
                <header className="main-header">
                    <div className="header-info">
                        <h1>Operational <span className="highlight">Dashboard</span></h1>
                        <p>Welcome back, Agent {username.split(' ')[0]}</p>
                    </div>
                    <div className="user-badge">
                        <div className="avatar-circle">{username.charAt(0)}</div>
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
                                <span className="label">Terminal:</span>
                                <span className="value">{useremail}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Clearance:</span>
                                <span className="value accent">Level 1 (Recruit)</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card action-card">
                        <h3>Active Missions</h3>
                        <div className="mission-list">
                            <div className="mission-item">
                                <span className="m-name">SQL Injection Lab</span>
                                <span className="status-tag ongoing">In Progress</span>
                            </div>
                            <div className="mission-item">
                                <span className="m-name">Nmap Scanning Basics</span>
                                <span className="status-tag locked">Locked</span>
                            </div>
                        </div>
                        <button className="launch-btn" onClick={() => navigate("/labs")}>
                            Access Lab Environment
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;