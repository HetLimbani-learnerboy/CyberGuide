import React, { useEffect, useState } from "react";
import Slidebar from "./Slidebar";
import "./ResourcePage.css";

const ResourcePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [labpdfs, setLabpdfs] = useState([]);
  const [pdfs, setPdfs] = useState([]);

  const BACKEND_URL = "http://127.0.0.1:8000";

  const fetchLabPdfs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/getlabpdfs/`);
      const data = await res.json();
      const sortdata = (data.data || []).sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      );
      setLabpdfs(sortdata);
    } catch (err) {
      console.error("Error fetching Lab PDFs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPDFs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/getpdfs/`);
      const data = await res.json();
      const sortedData = (data.data || []).sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      );
      setPdfs(sortedData);
    } catch (err) {
      console.error("Error fetching PDFs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabPdfs();
    fetchPDFs();
  }, []);

  return (
    <div className="resourcepage-container">
      {/* NAVBAR */}
      <div className="resource-navbar">
        <Slidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>☰</button>
      </div>

      {/* UPLOAD BUTTON */}
      <button className="upload-btn" onClick={() => setFormOpen(true)}>
        Upload Resource +
      </button>

      {/* FORM OVERLAY */}
      {formOpen && (
        <div className="form-overlay">
          <div className="upload-form">
            <h2>Upload New Resource</h2>
            <input type="text" placeholder="Resource Title" />
            <textarea placeholder="Resource Description"></textarea>
            <input type="file" accept=".pdf" />
            <button className="submit-btn">Submit Resource</button>
            <button className="cancel-btn" onClick={() => setFormOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <h1>Find Resources for Cyber Security and Other Security Topics</h1>

      {/* LABS SECTION */}
      <div className="labs-resource">
        <h2>Labs Resource</h2>
        <div className="pdf-grid">
          {labpdfs.length > 0 ? (
            labpdfs.map((pdf, index) => (
              <div className="pdf-row-card" key={index}>
                <div className="pdf-info">
                  <span className="pdf-icon">🧪</span>
                  <div className="pdf-details">
                    <span className="pdf-name">{pdf.name}</span>
                    <p className="pdf-meta">Lab Document • PDF</p>
                  </div>
                </div>
                <div className="pdf-actions">
                  <a href={`${BACKEND_URL}${pdf.url}`} target="_blank" rel="noreferrer" className="view-link">
                    View Document
                  </a>
                </div>
              </div>
            ))
          ) : (
            !loading && <p className="empty-state">No lab resources available.</p>
          )}
        </div>
      </div>

      {/* THEORETICAL SECTION */}
      <div className="theorical-resource">
        <h2>Theoretical Resources</h2>
        <div className="pdf-grid">
          {pdfs.length > 0 ? (
            pdfs.map((pdf, index) => (
              <div className="pdf-row-card" key={index}>
                <div className="pdf-info">
                  <span className="pdf-icon">📕</span>
                  <div className="pdf-details">
                    <span className="pdf-name">{pdf.name}</span>
                    <p className="pdf-meta">Security Document • PDF</p>
                  </div>
                </div>
                <div className="pdf-actions">
                  <a href={`${BACKEND_URL}${pdf.url}`} target="_blank" rel="noreferrer" className="view-link">
                    View Document
                  </a>
                </div>
              </div>
            ))
          ) : (
            !loading && <p className="empty-state">No theoretical resources available.</p>
          )}
        </div>
      </div>

      {/* LOADING SPINNER */}
      {loading && (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading Resources...</p>
        </div>
      )}
    </div>
  );
};

export default ResourcePage;