import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutPage.css';

const AboutPage = () => {
    const navigate = useNavigate();

    return (
        <div className="about-page-container">
            {/* Header Branding */}
            <header className="about-header">
                <h1>About <span className="guide-text">CyberGuide</span></h1>
            </header>

            <main className="about-content">
                {/* Mission Section */}
                <section className="about-section">
                    <h2>🛡️ Our Mission</h2>
                    <p>
                        CyberGuide was developed to bridge the gap between theoretical cybersecurity and practical 
                        application. Our platform provides a safe, containerized environment where students can 
                        practice ethical hacking and defense strategies without any risk to their local systems.
                    </p>
                </section>

                {/* Tech Stack Section */}
                <section className="about-section">
                    <h2>⚙️ The Technology</h2>
                    <div className="tech-badges">
                        <span>React.js</span>
                        <span>Django</span>
                        <span>Docker</span>
                        <span>Gemini AI</span>
                        <span>PostgreSQL</span>
                    </div>
                    <p>
                        By leveraging <b>Docker</b> for lab isolation and <b>Google's Gemini API</b> for real-time 
                        guidance, CyberGuide offers an industrial-level learning experience directly on your localhost.
                    </p>
                </section>

                {/* Developer Section */}
                <section className="about-section developer-card">
                    <h2>👨‍💻 The Developer</h2>
                    <h3>Het Limbani</h3>
                    <p>Computer Science Engineering Student (AI & ML) | Adani University</p>
                    <p>
                        Enthusiastic Full-Stack Developer focused on building secure, 
                        AI-integrated web applications that solve real-world problems.
                    </p>
                </section>

                {/* Back Button */}
                <div className="back-action">
                    <button className="back-home-btn" onClick={() => navigate('/')}>
                        ⬅ Back to Home
                    </button>
                </div>
            </main>
            
        </div>
    );
};

export default AboutPage;