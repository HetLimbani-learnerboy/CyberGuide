import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slidebar from "./Slidebar";
import "./Dashboardpage.css";

const BACKEND_URL = "http://127.0.0.1:8000";
const API_KEY = import.meta.env.VITE_NEWS_API_KEY;

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [useremail, setUseremail] = useState("");
  const [loading, setLoading] = useState(true);
  const [newsList, setNewsList] = useState([]);
  const [visibleNews, setVisibleNews] = useState(9);
  const [newsLoading, setNewsLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {

    const fetchUserData = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/getuserdata/`, {
          credentials: "include"
        });

        const data = await res.json();
        setUsername(data.name);
        setUseremail(data.email);

        if (data.email) {
          localStorage.setItem("cyberguide_user_email", data.email);
          localStorage.setItem("cyberguide_user_name", data.name);
        }

      } catch (error) {
        console.error("User fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchNews = async () => {
      try {
        const response = await fetch(
          `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=cybersecurity&language=en`
        );

        const data = await response.json();

        if (data.results) {
          setNewsList(data.results);
        }

      } catch (error) {
        console.log("News fetch error:", error);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchUserData();
    fetchNews();

    // Auto refresh user data every 3 seconds
    const interval = setInterval(fetchUserData, 3000);

    return () => clearInterval(interval);

  }, [navigate]);



  const loadMoreNews = () => {
    setVisibleNews(prev => prev + 6);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Initializing Secure Session...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
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

      <main className="dashboard-main">

        <header className="main-header">
          <div className="header-info">
            <h1>
              Operational <span className="highlight">Dashboard</span>
            </h1>

            <p>
              Welcome back, Agent {username ? username.split(" ")[0] : "User"}
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
                <span className="value">{username || "N/A"}</span>
              </div>

              <div className="detail-row">
                <span className="label">Email:</span>
                <span className="value">{useremail || "N/A"}</span>
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

            <button
              className="launch-btn"
              onClick={() => navigate("/labs")}
            >
              Access Lab Environment
            </button>
          </div>

        </div>



        <div className="news-section-full">
          <h3>Latest Security Intelligence</h3>

          {newsLoading ? (
            <p className="loading-text">Decrypting feeds...</p>
          ) : (
            <div className="news-grid">

              {newsList.slice(0, visibleNews).map((item, index) => (
                <div key={index} className="news-card">

                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt="news"
                      className="news-image"
                    />
                  )}

                  <div className="news-content">
                    <h4>{item.title}</h4>

                    <p>
                      {item.description
                        ? item.description.substring(0, 120) + "..."
                        : "No description available"}
                    </p>

                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="news-link"
                    >
                      Read Briefing →
                    </a>

                  </div>

                </div>
              ))}

            </div>
          )}

          {visibleNews < newsList.length && (
            <button className="load-more-btn" onClick={loadMoreNews}>
              View More Intelligence
            </button>
          )}

        </div>

      </main>
    </div>
  );
};

export default Dashboard;