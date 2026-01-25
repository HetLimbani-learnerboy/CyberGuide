import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./SignInPage.css";
import eyeopen from "../assets/eye_open.png";
import eyeclose from "../assets/eye-close.svg";
import MainLogo from "../assets/image.png";

const SignIn = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const togglePassword = () => setShowPassword((p) => !p);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      // ✅ later replace this URL with Django login API
      const res = await fetch("http://localhost:3021/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("name", data.user.name);
        localStorage.setItem("email", data.user.email);

        alert("Login successful!");
        navigate("/commondashboard");
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-wrapper">
      {/* LEFT SIDE (FORM) */}
      <section className="signin-left">
        <div className="signin-card animate-slide">
          <h2 className="form-title">
            Sign In to <span className="brand-highlight">CyberGuide</span>
          </h2>

          <form onSubmit={handleSubmit} className="signin-form">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="toggle-password"
                onClick={togglePassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <img
                  src={
                    showPassword?
                     eyeopen:
                        eyeclose
                  }
                  alt={showPassword ? "Hide password" : "Show password"}
                />
              </button>
            </div>

            <button type="submit" className="signin-btn" disabled={loading}>
              {loading ? <span className="loader"></span> : "Sign In"}
            </button>
          </form>
          <button className="google-signin-btn">
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google Logo"
              className="google-icon"
            />
            <span>Sign In with Google</span>
          </button>

          <span
            className="forget-password"
            onClick={() => navigate("/forget-password")}
          >
            Forgot Password?
          </span>

          <p className="switch-text">
            Don’t have an account?{" "}
            <span onClick={() => navigate("/signup")}>Sign Up</span>
          </p>

          <p className="switch-text-back">
            <span onClick={() => navigate("/")}>Back to home</span>
          </p>
        </div>
      </section>

      {/* RIGHT SIDE (BRANDING) */}
      <section className="signin-right">
        <div className="branding">
          <img src={MainLogo} alt="CyberGuide Logo" className="brand-logo" />
          <h1>Welcome Back to CyberGuide</h1>
          <p>
            Continue your journey with hands-on labs, AI mentor, and secure
            learning environment.
          </p>
        </div>
      </section>
    </div>
  );
};

export default SignIn;
