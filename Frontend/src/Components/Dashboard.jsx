import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "./Dashboardpage.css";

const Dashboard = ({ isAuthenticated }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [useremail, setUseremail] = useState("");

    // // Protecting the route
    // if (!isAuthenticated) {
    //     return <Navigate to="/login" />;
    // }

    useEffect(() => {
        const name = localStorage.getItem("cyberguide_user_name");
        const email = localStorage.getItem("cyberguide_user_email");
        setUseremail(email || "Operator@cyberguide.dev");
        setUsername(name || "Recruit");
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
        window.location.reload(); // Ensures state is reset
    };

    return (
        <div className="dashboard-wrapper">
            {/* --- SIDEBAR NAVIGATION --- */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-logo">
                    <h2>Cyber<span>Guide</span></h2>
                </div>
                
                <nav className="sidebar-nav">
                    <button className="nav-item active">📊 Overview</button>
                    <button className="nav-item" onClick={() => navigate("/labs")}>🛡️ Active Labs</button>
                    <button className="nav-item" onClick={() => navigate("/tools")}>🛠️ Toolset</button>
                    <button className="nav-item" onClick={() => navigate("/chatbot")}>🤖 AI Mentor</button>
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="dashboard-main">
                <header className="main-header">
                    <div className="header-info">
                        <h1>Operational <span className="highlight">Dashboard</span></h1>
                        <p>Welcome back, Agent {username.split(' ')[0]}</p>
                    </div>
                    <div className="user-badge">
                        <div className="avatar-circle">{username.charAt(0)}</div>
                        <span>{username}</span>
                    </div>
                </header>

                <div className="dashboard-grid">
                    {/* Profile Stats Card */}
                    <div className="stat-card profile-card">
                        <h3>Profile Identity</h3>
                        <div className="profile-details">
                            <p><strong>Full Name:</strong> {username}</p>
                            <p><strong>Terminal Email:</strong> {useremail}</p>
                            <p><strong>Security Clearances:</strong> Level 1 (Recruit)</p>
                        </div>
                    </div>

                    {/* Quick Start Labs Card */}
                    <div className="stat-card action-card">
                        <h3>Active Missions</h3>
                        <div className="mission-item">
                            <span>SQL Injection Lab</span>
                            <span className="status-tag ongoing">In Progress</span>
                        </div>
                        <div className="mission-item">
                            <span>Nmap Scanning Basics</span>
                            <span className="status-tag locked">Locked</span>
                        </div>
                        <button className="launch-btn" onClick={() => navigate("/labs")}>Launch Lab Environment</button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;