import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown"; 
import "./ChatBoat.css";
import chatbot from "../assets/chatbotimg.png";

const ChatBot = () => {
    const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your CyberGuide AI Mentor. How can I help you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!prompt.trim() || loading) return;

    const userText = prompt.trim();
    setPrompt("");
    setLoading(true);
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);

    try {
      const res = await fetch("http://localhost:8000/api/chatbot/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userText }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.response },
        ]);
      } else {
        const errorMsg = res.status === 429 
          ? "System is currently overloaded. Please wait 30 seconds." 
          : (data.message || "Something went wrong.");
          
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: `Error: ${errorMsg}` },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Connection failed. Ensure the Django server is running on port 8000." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-wrapper">
      <div className="chatbot-container">
        <header className="chatbot-header">
  <div className="header-left">
    <img src={chatbot} alt="AI" className="chatbot-image" />
    <div className="header-text">
      <h2>Cyber<span>Guide</span> AI</h2>
      <p className="status-indicator">● Online - Mentor Mode</p>
    </div>
  </div>
  
  <div className="header-actions">
    <button className="back-button" onClick={() => navigate('/dashboard')}>
      Back to Dashboard
    </button>
    <button className="clear-chat" onClick={() => setMessages([messages[0]])}>
      Clear Chat
    </button>
  </div>
</header>

        <div className="chatbot-history">
          {messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.sender}`}>
              <div className="message-bubble">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-wrapper bot">
              <div className="message-bubble typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chatbot-input-area">
          <textarea
            className="chatbot-textarea"
            placeholder="Ask about SQLi, Nmap, or something else..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="chatbot-send-btn"
            onClick={handleSend}
            disabled={loading || !prompt.trim()}
          >
            {loading ? <div className="btn-spinner"></div> : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;