import React from "react";
import { useNavigate } from "react-router-dom";
import "./Slidebar.css";

const Slidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const BACKEND_URL = "http://127.0.0.1:8000";

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const goTo = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const onLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/auth/logout/`, {
        method: "GET",
        credentials: "include",
      });
    } catch (error) {
      console.log("Logout error:", error);
    }

    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <aside className={`dashboard-sidebar ${isOpen ? "open" : ""}`}>

        <button className="sidebar-close" onClick={closeSidebar}>
          ✕
        </button>

        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => goTo("/dashboard")}>
            🏠 Dashboard
          </button>

          <button className="nav-item" onClick={() => goTo("/labs")}>
            🛡️ Active Labs
          </button>

          <button className="nav-item" onClick={() => goTo("/resources")}>
            📚 Resources
          </button>

          <button className="nav-item" onClick={() => goTo("/chatbot")}>
            🤖 AI Mentor
          </button>

          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </nav>

      </aside>

      {isOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}
    </>
  );
};

export default Slidebar;