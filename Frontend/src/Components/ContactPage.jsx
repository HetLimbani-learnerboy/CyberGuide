import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ContactPage.css';

const BACKEND_URL = "http://127.0.0.1:8000";

const ContactPage = () => {
    const navigate = useNavigate();

    const [status, setStatus] = useState("");
    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setStatus("Sending...");

        try {
            const res = await fetch(`${BACKEND_URL}/auth/contactus/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("Message sent successfully ✅");
                setForm({
                    name: "",
                    email: "",
                    subject: "",
                    message: ""
                });
            } else {
                setStatus(data.error || "Failed to send message ❌");
            }

        } catch (error) {
            console.error(error);
            setStatus("Server error. Try again later.");
        }
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
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Enter name here"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Enter Email here"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Subject</label>
                            <select
                                name="subject"
                                value={form.subject}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a topic</option>
                                <option value="support">Technical Support</option>
                                <option value="feedback">Lab Feedback</option>
                                <option value="business">Business Inquiry</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Message</label>
                            <textarea
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                placeholder="How can we help you?"
                                required
                            />
                        </div>

                        <button type="submit" className="contact-submit-btn">
                            Transmit Message
                        </button>

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
                        <p>hetlimbani5506@gmail.com</p>
                    </div>

                    <div className="info-card">
                        <h3>🌐 Social Platform</h3>
                        <div className="social-links">
                            <a href="https://www.linkedin.com/in/het-limbani-a62a8131a/" target="_blank" rel="noreferrer">LinkedIn</a>
                            <a href="https://github.com/HetLimbani-learnerboy" target="_blank" rel="noreferrer">GitHub</a>
                        </div>
                    </div>

                    <button className="back-btn" onClick={() => navigate('/')}>
                        Back to Home
                    </button>
                </section>
            </div>
        </div>
    );
};

export default ContactPage;