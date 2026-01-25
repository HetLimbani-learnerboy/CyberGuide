import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ContactPage.css';

const ContactPage = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus("Message Sent Successfully! 🛡️");
    };

    return (
        <div className="contact-page-container">
            <header className="contact-header">
                <h1>Contact <span className="guide-text">CyberGuide</span></h1>
                <p>Have questions about the labs or need technical support? We're here to help.</p>
            </header>

            <div className="contact-wrapper">
                <section className="contact-form-section">
                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="input-group">
                            <label>Full Name</label>
                            <input type="text" placeholder="Enter name here" required />
                        </div>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input type="email" placeholder="Enter Email here" required />
                        </div>
                        <div className="input-group">
                            <label>Subject</label>
                            <select required>
                                <option value="">Select a topic</option>
                                <option value="support">Technical Support</option>
                                <option value="feedback">Lab Feedback</option>
                                <option value="business">Business Inquiry</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Message</label>
                            <textarea placeholder="How can we help you?" required></textarea>
                        </div>
                        <button type="submit" className="contact-submit-btn">Transmit Message</button>
                        {status && <p className="status-msg">{status}</p>}
                    </form>
                </section>

                <section className="contact-info-panel">
                    <div className="info-card">
                        <h3>📍 Location</h3>
                        <p>Ahmedabad, Gujarat, India</p>
                    </div>
                    <div className="info-card">
                        <h3>📧 Email</h3>
                        <p>hetlimbani61@gmail.com</p>
                    </div>
                    <div className="info-card">
                        <h3>🌐 Social Platform</h3>
                        <div className="social-links">
                            <a href="https://www.linkedin.com/in/het-limbani-a62a8131a/" target="_blank" rel="noreferrer">LinkedIn</a>
                            <a href="https://github.com/HetLimbani-learnerboy" target="_blank" rel="noreferrer">GitHub</a>
                        </div>
                    </div>
                    <button className="back-btn" onClick={() => navigate('/')}>Back to Home</button>
                </section>
            </div>
        </div>
    );
};

export default ContactPage;