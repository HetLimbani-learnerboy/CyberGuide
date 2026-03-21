import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slidebar from "./Slidebar";
import "./ResourcePage.css";

const ResourcePage = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [showEmptyMsg, setShowEmptyMsg] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [labpdfs, setLabpdfs] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [myResources, setMyResources] = useState([]);

  const BACKEND_URL = "http://127.0.0.1:8000";
  const userEmail = localStorage.getItem("cyberguide_user_email");
  const username = localStorage.getItem("cyberguide_user_name")

  const fetchLabPdfs = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/getlabpdfs/`);
      const data = await res.json();

      const sortedLabs = (data.data || []).sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      );

      setLabpdfs(sortedLabs);
    } catch (err) { console.error("Labs Fetch Error:", err); }
  };

  const fetchPDFs = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/getpdfs/`);
      const data = await res.json();
      const sortedTheory = (data.data || []).sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      );

      setPdfs(sortedTheory);
    } catch (err) { console.error("Theoretical Fetch Error:", err); }
  };

  const fetchMyResources = async () => {
    if (!userEmail) return;
    try {
      const res = await fetch(`${BACKEND_URL}/auth/get-user-resources/?email=${userEmail}`);
      const data = await res.json();
      if (res.ok) setMyResources(data.data || []);
    } catch (err) { console.error("Personal Fetch Error:", err); }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchLabPdfs(), fetchPDFs(), fetchMyResources()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
    const timer = setTimeout(() => {
      setShowEmptyMsg(true);
    }, 30000); 

    return () => clearTimeout(timer); 
  }, []);


  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !title) return alert("Please provide a title and a PDF file.");

    const formData = new FormData();
    formData.append("email", userEmail || "anonymous@cyberguide.com");
    formData.append("title", title);
    formData.append("pdf", selectedFile);

    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/upload-resource/`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Success! File uploaded to AWS S3 and record saved.");
        setFormOpen(false);
        setTitle("");
        setSelectedFile(null);
        fetchMyResources();
      } else {
        const errData = await res.json();
        alert(`Upload Failed: ${errData.error || "Unknown Error"}`);
      }
    } catch (err) {
      alert("Network Error: Could not connect to the server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="resourcepage-container">
      <div className="resource-bg-overlay"></div>

      <div className="resource-navbar">
        <Slidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>☰</button>
      </div>

      <div className="page-header">
        <h1>Cyber<span>Guide</span> Library</h1>
        <p>Access curated security labs, theoretical papers, and your personal cloud storage.</p>
        <button className="upload-trigger-btn" onClick={() => setFormOpen(true)}>
          Upload to Cloud +
        </button>
      </div>

      {formOpen && (
        <div className="form-overlay">
          <form className="upload-modal" onSubmit={handleUpload}>
            <h2>Cloud Upload (S3)</h2>
            <p>Your file will be accessible globally via AWS.</p>

            <input
              type="text"
              placeholder="Display Title (e.g. Nmap Basics)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="file-input-wrapper">
              <label>Select PDF Document:</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? <div className="btn-spinner"></div> : "Start Upload"}
              </button>
              <button type="button" className="cancel-btn" onClick={() => setFormOpen(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="resource-sections-wrapper">
        <section className="resource-section my-cloud">
          <div className="section-title centered-title full-width-section">
            <h2>{username}'s Cloud Resources ☁️</h2>
          </div>

          <div className="pdf-grid">
            {myResources.length > 0 ? (
              myResources.map((pdf, index) => (
                <div className="pdf-card cloud-item" key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="card-top">
                    <span className="tag">Cloud</span>
                    <h3>{pdf.title}</h3>
                  </div>
                  <a href={pdf.pdf_url} target="_blank" rel="noreferrer" className="view-btn">
                    View on AWS
                  </a>
                </div>
              ))
            ) : !showEmptyMsg ? (
              <div className="internal-loader">
                <div className="mini-spinner"></div>
                <p>Searching cloud storage...</p>
              </div>
            ) : (
              <p className="empty-msg">No personal uploads found for this account.</p>
            )}
          </div>
        </section>
        <section className="resource-section  my-cloud">
          <div className="section-title centered-title full-width-section">
            <h2>Practical Labs 💻</h2>
          </div>
          <div className="pdf-grid">
            {labpdfs.map((pdf, index) => (
              <div className="pdf-card" key={index}>
                <h3>{pdf.name}</h3>
                <a href={`${BACKEND_URL}${pdf.url}`} target="_blank" rel="noreferrer" className="view-btn">View Lab</a>
              </div>
            ))}
          </div>
        </section>

        <section className="resource-section  my-cloud">
          <div className="section-title centered-title full-width-section">
            <span className="icon"></span>
            <h2>Theoretical Content 📕</h2>
          </div>
          <div className="pdf-grid">
            {pdfs.map((pdf, index) => (
              <div className="pdf-card" key={index}>
                <h3>{pdf.name}</h3>
                <a href={`${BACKEND_URL}${pdf.url}`} target="_blank" rel="noreferrer" className="view-btn">View</a>
              </div>
            ))}
          </div>
        </section>
      </div>

      {loading && (
        <div className="global-loader">
          <div className="loader-spinner"></div>
          <p>Syncing Library...</p>
        </div>
      )}
    </div>
  );
};

export default ResourcePage;