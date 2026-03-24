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
  const [newsLoading, setNewsLoading] = useState(true);

  const [newsList, setNewsList] = useState([]);
  const [visibleNews, setVisibleNews] = useState(9);

  const [isOpen, setIsOpen] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskStatus, setTaskStatus] = useState("Initial");

  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem("cyberguide_tasks");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("cyberguide_tasks", JSON.stringify(tasks));
  }, [tasks]);


  useEffect(() => {
    const storedName = localStorage.getItem("cyberguide_user_name");
    const storedEmail = localStorage.getItem("cyberguide_user_email");

    if (storedName) setUsername(storedName);
    if (storedEmail) setUseremail(storedEmail);

    const fetchUserData = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/getuserdata/`, {
          credentials: "include"
        });

        const data = await res.json();

        const finalName = data?.name || storedName;
        const finalEmail = data?.email || storedEmail;

        setUsername(finalName);
        setUseremail(finalEmail);

        if (data?.email && data?.name) {
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

  }, [navigate]);


  const addTask = (e) => {
    e.preventDefault();

    if (!taskTitle.trim()) return;

    const newTask = {
      id: Date.now(),
      title: taskTitle,
      status: taskStatus
    };

    setTasks([...tasks, newTask]);

    setTaskTitle("");
    setTaskStatus("Initial");
    setShowForm(false);
  };


  const deleteTask = (id) => {
    const updated = tasks.filter(task => task.id !== id);
    setTasks(updated);
  };


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

            <div className="card-header-flex">

              <h3>Active Missions</h3>

              <button
                className="add-task-btn"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? "×" : "+"}
              </button>

            </div>


            {showForm && (
              <div className="add-task-form">

                <form onSubmit={addTask}>

                  <input
                    className="task-title-input"
                    placeholder="Mission Objective"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />

                  <select
                    className="selection-div"
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                  >
                    <option value="Initial">Initial</option>
                    <option value="Working">Working</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <button type="submit" className="launch-btn">
                    Deploy Task
                  </button>

                </form>

              </div>
            )}

            <div className="mission-list">

              {tasks.length === 0 ? (
                <p style={{ color: "#94a3b8" }}>No missions yet</p>
              ) : (
                tasks.map(task => (

                  <div key={task.id} className="mission-item">

                    <span className="m-name">{task.title}</span>

                    <span className="status-tag">
                      {task.status}
                    </span>

                    <button onClick={() => deleteTask(task.id)}>✕</button>

                  </div>

                ))
              )}

            </div>
            <button className="launch-btn " onClick={() => navigate('/labs')}>
              Launch Lab
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