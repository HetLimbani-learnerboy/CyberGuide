import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const infoRef = useRef(null);
    const [scrolled, setScrolled] = useState(false);
    const terminalRef = useRef(null)


    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show-content');
                }
            },
            { threshold: 0.2 }
        );
        const el = terminalRef.current
        if (el) {
            el.scrollTop = el.scrollHeight
        }

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
                    <div className="hero-buttons">
                        <button
                            className="get-started-button"
                            onClick={() => navigate('/signup')}
                        >
                            Get Started
                        </button>

                        <button
                            className="social-module-button"
                            onClick={scrollToModules}
                        >
                            Social Module
                        </button>
                    </div>
                </div>

                <div className="terminal-wrapper">
                    <div className="terminal-box-landing">

                        <div className="terminal-header-landing">
                            <div className="terminal-dot-landing dot-red-landing"></div>
                            <div className="terminal-dot-landing dot-yellow-landing"></div>
                            <div className="terminal-dot-landing dot-green-landing"></div>
                        </div>


                        <div className="terminal-body-landing" ref={terminalRef}>

                            <p><span className="terminal-green">$</span> nmap -sV target.com</p>
                            <p className="typing">Scanning open ports...</p>

                            <p className="terminal-blue">22/tcp open ssh</p>
                            <p className="terminal-blue">80/tcp open http</p>
                            <p className="terminal-blue">443/tcp open https</p><br />

                            <p><span className="terminal-green">$</span>tcpdump -i eth0</p>
                            <p className="typing">Capturing network traffic...</p>

                            <p className="terminal-blue">IP: IP-Address → IP-Address TCP 443</p>
                            <p className="terminal-blue">IP: IP-Address → IP-Address TCP 80</p><br />

                            <p><span className="terminal-green">$</span>sqlmap -u "http://target.com/vuln.php?id=1" --dbs</p>
                            <p className="typing">Retrieving database management system information...</p>
                            <p className="terminal-blue">[INFO] the back-end DBMS is MySQL</p>
                            <p className="terminal-blue">[INFO] fetching database names...</p>
                            <p className="terminal-blue">[INFO] available databases [3]:</p>
                            <p className="terminal-blue">[INFO] [*] information_schema</p>
                            <p className="terminal-blue">[INFO] [*] users_db</p>
                            <p className="terminal-blue">[INFO] [*] products_db</p><br />

                            <p><span className="terminal-green">$</span> nc target.com 4444</p>

                            <p className='terminal-blue'>Connected to reverse shell...</p>

                            <p><span className="terminal-green">$</span> socat TCP-LISTEN:4444 STDOUT</p>
                            <p className="terminal-blue">Shell connection established</p><br />

                            <p><span className="terminal-green">$</span> msfconsole</p>
                            <p className="typing">Loading exploit modules...</p>

                        </div>
                    </div>
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

            <div className="project-outer-wrapper">
                <section className="project-info-container reveal-section" ref={infoRef}>
                    <div className="pulse-circle"></div>
                    <div className="pulse-grid-overlay"></div>

                    <div className="project-content-layer">
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
        </div>
    );
};

export default LandingPage;