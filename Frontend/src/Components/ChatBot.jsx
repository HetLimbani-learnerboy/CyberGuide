import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown"; 
import Slidebar from "./Slidebar";
import "./ChatBoat.css";
import chatbot from "../assets/chatbotimg.png";

const ChatBot = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const chatEndRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const savedChat = localStorage.getItem("cyberguide_chat");
    return savedChat ? JSON.parse(savedChat) : [
      {
        sender: "bot",
        text: "Hello! I am your CyberGuide AI Mentor. How can I help you today?",
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("cyberguide_chat", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (loading) scrollToBottom();
  }, [loading]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      const initialMessage = [
        {
          sender: "bot",
          text: "Hello! I am your CyberGuide AI Mentor. How can I help you today?",
        },
      ];
      setMessages(initialMessage);
      localStorage.removeItem("cyberguide_chat");
    }
  };

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
        { sender: "bot", text: "Connection failed. Ensure the Django server is running." },
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
    <div className="chatbot-bg-animation">
      <div className="circle-glow"></div>
      <div className="grid-overlay"></div>
    </div>

    <Slidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <button
        className="menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

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
            <button className="clear-chat" onClick={handleClearChat}>
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