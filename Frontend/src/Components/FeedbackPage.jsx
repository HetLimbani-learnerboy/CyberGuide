import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FeedbackPage.css';

const FeedbackPage = () => {
    const navigate = useNavigate();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ rating, comment });
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="feedback-page-container">
                <div className="feedback-card success-card">
                    <h2>Thank You! 🛡️</h2>
                    <p>Your feedback helps us make CyberGuide a better learning platform.</p>
                    <button className="back-home-btn" onClick={() => navigate('/')}>
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="feedback-page-container">
            <div className="feedback-card">
                <h1>Share Your <span className="guide-text">Experience</span></h1>
                <p>How would you rate your learning journey on CyberGuide?</p>

                <form onSubmit={handleSubmit} className="feedback-form">
                    <div className="star-rating">
                        {[...Array(5)].map((star, index) => {
                            index += 1;
                            return (
                                <button
                                    type="button"
                                    key={index}
                                    className={index <= (hover || rating) ? "on" : "off"}
                                    onClick={() => setRating(index)}
                                    onMouseEnter={() => setHover(index)}
                                    onMouseLeave={() => setHover(rating)}
                                >
                                    <span className="star">&#9733;</span>
                                </button>
                            );
                        })}
                    </div>

                    <textarea
                        placeholder="Tell us what you liked or how we can improve..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    ></textarea>

                    <button type="submit" className="submit-feedback-btn" disabled={rating === 0}>
                        Submit Feedback
                    </button>
                    
                    <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>
                        Maybe Later
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FeedbackPage;