import React from "react";
import Slidebar from "./Slidebar";
import "./ResourcePage.css";

const ResourcePage = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);

  return (
    <div className="resourcepage-container">

      <div className="resource-navbar">
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
      </div>

      <button
        className="upload-btn"
        onClick={() => setFormOpen(true)}
      >
        Upload Resource +
      </button>

      {formOpen && (
        <div className="upload-form">
          <h2>Upload New Resource</h2>

          <input
            type="text"
            placeholder="Resource Title"
            required
          />

          <textarea
            placeholder="Resource Description"
            required
          ></textarea>

          <input
            type="file"
            required
          />

          <button className="submit-btn">
            Submit Resource
          </button>

          <button
            className="cancel-btn"
            onClick={() => setFormOpen(false)}
          >
            Cancel
          </button>
        </div>
      )}

      <h1>
        Find Resources for Cyber Security and Other Security Topics
      </h1>

      <p>
        Welcome to the Resources page! Here you can find a variety
        of materials to help you learn more about cybersecurity.
      </p>

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