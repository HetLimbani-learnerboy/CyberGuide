import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Slidebar.css';

const Slidebar = ({ onLogout }) => {
    const navigate = useNavigate();

    return (
        <aside className="dashboard-sidebar">
            <div className="sidebar-logo">
                <h2>Cyber<span>Guide</span></h2>
            </div>
            
            <nav className="sidebar-nav">
                <button className="nav-item active" onClick={() => navigate("/dashboard")}>
                    📊 Overview
                </button>
                <button className="nav-item" onClick={() => navigate("/labs")}>
                    🛡️ Active Labs
                </button>
                <button className="nav-item" onClick={() => navigate("/tools")}>
                    🛠️ Toolset
                </button>
                <button className="nav-item" onClick={() => navigate("/chatbot")}>
                    🤖 AI Mentor
                </button>
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={onLogout}>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Slidebar;