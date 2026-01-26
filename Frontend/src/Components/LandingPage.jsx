import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import cyberImage from '../assets/CyberSecurity.png';

const LandingPage = () => {
    const navigate = useNavigate();
    const infoRef = useRef(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show-content');
                }
            },
            { threshold: 0.2 }
        );

        if (infoRef.current) {
            observer.observe(infoRef.current);
        }

        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToModules = () => {
        infoRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="landing-page-container">
            <header className='landingpage-header'>
                <h1>Cyber<span className="guide-text">Guide</span></h1>
                <nav>
                    <button onClick={() => navigate('/about')}>About</button>
                    <button onClick={() => navigate('/signup')}>Register</button>
                    <button onClick={() => navigate('/login')}>Login</button>
                </nav>
            </header>

            <main className="landingpage-content">
                <div className="hero-text-section">
                    <h2>Welcome to CyberGuide</h2>
                    <p>
                        Master Cybersecurity through hands-on practice in a safe, 
                        isolated environment powered by Docker and AI.
                    </p>
                    <button className="get-started-button" onClick={() => navigate('/signup')}>
                        Get Started
                    </button>
                </div>
                
                <div className="hero-image-container">
                    <img 
                        className='hero-cyber-image' 
                        src={cyberImage} 
                        alt='Cyber Security Illustration'
                    />
                </div>

                <div 
                    className={`scroll-down-wrapper ${scrolled ? 'scroll-hidden' : ''}`} 
                    onClick={scrollToModules}
                >
                    <div className="mouse-body">
                        <div className="mouse-wheel"></div>
                    </div>
                    <span className="scroll-text">Scroll Down</span>
                </div>
            </main>

            <section className="project-info-container reveal-section" ref={infoRef}>
                <h3>System Modules</h3>
                
                <div className="info-grid">
                    <div className="info-item">
                        <h4>🟥 Virtual Lab Environment</h4>
                        <p>Experience real-world scenarios with our Attacker vs Victim Docker terminals. Practice exploits safely on localhost.</p>
                    </div>

                    <div className="info-item">
                        <h4>🤖 AI-Powered Mentor</h4>
                        <p>Integrated Gemini AI Chatbot provides hints, explains complex commands, and guides you step-by-step through labs.</p>
                    </div>

                    <div className="info-item">
                        <h4>📊 Progress & Logging</h4>
                        <p>Every command executed in the labs is logged for your learning analysis and progress tracking.</p>
                    </div>

                    <div className="info-item">
                        <h4>🛠️ Tool Knowledge Base</h4>
                        <p>Learn industry-standard tools like Nmap, Wireshark, and Burp Suite with detailed practical examples.</p>
                    </div>

                    <div className="info-item">
                        <h4>📝 Personal Learning Hub</h4>
                        <p>Save lab-specific notes and access curated cybersecurity vlogs for theoretical depth.</p>
                    </div>
                </div>
            </section>

            <footer className='landingpage-footer-container'>
                <div className='left-side'>
                    <p>&copy; 2026 Cyber<span className="guide-text">Guide</span>. Secured Environment.</p>
                </div>
                
                <div className='center-container'>
                    <a href="/about">About Us</a>
                    <span className="separator">|</span>
                    <a href="/feedback">Feedback</a> 
                    <span className="separator">|</span>
                    <a href="/contact">Contact</a>

                </div>
                
                <div className='rightside-container'>
                    <h3>Developed by Het Limbani</h3>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;