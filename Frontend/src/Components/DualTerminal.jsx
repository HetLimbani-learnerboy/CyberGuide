import React, { useState } from 'react';
import axios from 'axios';
import TerminalInstance from './Terminal';
import Slidebar from './Slidebar';
import './Terminal.css';

const DualTerminal = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);


  const toggleLab = async (action) => {
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/lab/control/', { action });
      setIsRunning(action === 'start');
    } catch (error) {
      alert("Error: Ensure Django is running on port 8000 and Docker Desktop is open.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <main className="dashboard-main">
        <header className="main-header">
          <Slidebar
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />

          <button
            className="menu-toggle"
            onClick={() => setIsOpen(!isOpen)}
          >
            ☰
          </button>

          <div className="header-info">
            <h1>Cyber Lab <span className="highlight">Dashboard</span></h1>
            <p>Manage your virtual attack and defense nodes.</p>
          </div>

          <div className="lab-controls">
            {!isRunning ? (
              <button
                onClick={() => toggleLab('start')}
                disabled={loading}
                className={`launch-btn start ${loading ? 'loading' : ''}`}
              >
                {loading ? 'BOOTING ENVIRONMENT...' : 'START LAB SESSION'}
              </button>
            ) : (
              <button
                onClick={() => toggleLab('stop')}
                disabled={loading}
                className={`launch-btn stop ${loading ? 'loading' : ''}`}
              >
                {loading ? 'SHUTTING DOWN...' : 'TERMINATE SESSION'}
              </button>
            )}
          </div>
        </header>

        <div className="terminal-grid">
          <TerminalInstance
            type="attacker"
            title="ATTACKER NODE"
            color="#ff3e3e"
            isLabRunning={isRunning}
          />
          <TerminalInstance
            type="victim"
            title="VICTIM SERVER"
            color="#38bdf8"
            isLabRunning={isRunning}
          />
        </div>

        <footer className="dashboard-footer">
          <div className="status-indicator">
            <span className={`dot ${isRunning ? 'active' : ''}`}></span>
            {isRunning ? 'System Online: Network 172.20.0.0/24' : 'System Offline'}
          </div>
        </footer>
      </main>
    </div>
  );
};

export default DualTerminal;