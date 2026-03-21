import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FeedbackPage.css';

const BACKEND_URL = "http://127.0.0.1:8000";

const FeedbackPage = () => {
    const navigate = useNavigate();

    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [feedbacks, setFeedbacks] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/auth/getfeedbacks/`);
            const data = await res.json();
            setFeedbacks(data.data || []);
        } catch (err) {
            console.error("Error fetching feedback:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await fetch(`${BACKEND_URL}/auth/addfeedback//`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    rating,
                    comment
                })
            });

            setName("");
            setEmail("");
            setRating(0);
            setComment("");
            
            await fetchFeedbacks();
        } catch (err) {
            alert("Failed to submit feedback. Please check your connection.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="feedback-page-container">
            <div className="feedback-card">
                <h1>Share Your <span className="guide-text">Experience</span></h1>

                <form onSubmit={handleSubmit} className="feedback-form">
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={submitting}
                    />

                    <input
                        type="email"
                        placeholder="Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={submitting}
                    />

                    <div className="star-rating">
                        {[...Array(5)].map((_, index) => {
                            index += 1;
                            return (
                                <button
                                    type="button"
                                    key={index}
                                    className={index <= (hover || rating) ? "on" : "off"}
                                    onClick={() => setRating(index)}
                                    onMouseEnter={() => setHover(index)}
                                    onMouseLeave={() => setHover(rating)}
                                    disabled={submitting}
                                >
                                    <span className="star">&#9733;</span>
                                </button>
                            );
                        })}
                    </div>

                    <textarea
                        placeholder="Write your feedback..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        disabled={submitting}
                    />

                    <button 
                        type="submit" 
                        className="submit-btn" 
                        disabled={rating === 0 || submitting}
                    >
                        {submitting ? <div className="spinner"></div> : "Submit Feedback"}
                    </button>
                </form>

                <div className="feedback-list">
                    <h3>All Feedback</h3>
                    
                    {loading ? (
                        <div className="list-loader">
                            <div className="spinner"></div>
                            <p>Syncing feedback...</p>
                        </div>
                    ) : feedbacks.length > 0 ? (
                        feedbacks.map((fb, index) => (
                            <div key={index} className="feedback-item">
                                <h4>{fb.name}</h4>
                                <p className="email">{fb.email}</p>
                                <div className="rating-display">{"★".repeat(fb.rating)}</div>
                                <p>{fb.comment}</p>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', opacity: 0.5 }}>No feedback yet. Be the first!</p>
                    )}
                </div>

                <button className="back-btn" onClick={() => navigate('/')} disabled={submitting}>
                    Back
                </button>
            </div>
        </div>
    );
};

export default FeedbackPage;