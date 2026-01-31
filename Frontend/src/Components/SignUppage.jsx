import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./SignUpPage.css";

import eyeopen from "../assets/eye_open.png";
import eyeclose from "../assets/eye-close.svg";
import SignupImg from "../assets/Signupimg.png";

const API_URL = "http://localhost:8000/api";

const SignUp = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);

  const [passwordValid, setPasswordValid] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
    match: false,
  });

  const safeJson = async (res) => {
    try {
      return await res.json();
    } catch {
      return {};
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({ ...prev, password: value }));

    setPasswordValid((prev) => ({
      ...prev,
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[!@#$%^&*]/.test(value),
      match: value === formData.confirmPassword,
    }));
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({ ...prev, confirmPassword: value }));

    setPasswordValid((prev) => ({
      ...prev,
      match: value === formData.password,
    }));
  };

  const isPasswordAllValid =
    passwordValid.length &&
    passwordValid.upper &&
    passwordValid.lower &&
    passwordValid.number &&
    passwordValid.special &&
    passwordValid.match;

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordAllValid) {
      alert("Please follow password rules and confirm password correctly.");
      return;
    }

    setLoading(true);

    try {
      const signupRes = await fetch(`${API_URL}/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const signupData = await safeJson(signupRes);

      if (!signupRes.ok) {
        alert(signupData.message || "Signup Failed");
        return;
      }

      const otpRes = await fetch(`${API_URL}/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.trim() }),
      });

      const otpData = await safeJson(otpRes);

      if (!otpRes.ok) {
        alert(otpData.message || otpData.error || "OTP sending failed");
        return;
      }

      alert("OTP sent to your email ");
      setStep(2);
    } catch (err) {
      console.log(err);
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      alert("Enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const verifyRes = await fetch(`${API_URL}/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          otp: otp.trim(),
        }),
      });

      const verifyData = await safeJson(verifyRes);

      if (!verifyRes.ok) {
        alert(verifyData.message || verifyData.error || "OTP Verification Failed");
        return;
      }

      alert("OTP Verified Successfully");
      localStorage.setItem("cyberguide_user_email", formData.email.trim());
      localStorage.setItem("cyberguide_user_name", formData.name.trim());
      
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    alert("Google Signup feature will be added soon ✅");
  };

  return (
    <div className="signup-page">
      <div className="signup-left">
        <img src={SignupImg} alt="Signup" className="signup-illustration" />
        <h2>Welcome to CyberGuide</h2>
        <p>Learn cybersecurity with safe labs, tools, and AI guidance.</p>
      </div>

      <div className="signup-right">
        {step === 1 && (
          <form onSubmit={handleSignupSubmit} className="signup-form">
            <h2>Create Your Account</h2>

            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />

            <div className="password-wrapper">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handlePasswordChange}
                required
              />

              <img
                src={passwordVisible ? eyeopen : eyeclose}
                alt="toggle"
                className="toggle-password-img"
                onClick={() => setPasswordVisible((prev) => !prev)}
              />
            </div>

            <div className="password-rules">
              <p style={{ color: passwordValid.length ? "green" : "red" }}>
                • Minimum 8 characters
              </p>
              <p style={{ color: passwordValid.upper ? "green" : "red" }}>
                • Uppercase letter
              </p>
              <p style={{ color: passwordValid.lower ? "green" : "red" }}>
                • Lowercase letter
              </p>
              <p style={{ color: passwordValid.number ? "green" : "red" }}>
                • Number (0-9)
              </p>
              <p style={{ color: passwordValid.special ? "green" : "red" }}>
                • Special character (!@#$%^&*)
              </p>
            </div>

            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
            />
            <p style={{ color: passwordValid.match ? "green" : "red" }}>
                • Passwords match
              </p>
            <button
              type="submit"
              className="signup-btn"
              disabled={loading || !isPasswordAllValid}
            >
              {loading ? <span className="loader"></span> : "Sign Up"}
            </button>

            <button
              type="button"
              className="googlesignup-btn"
              disabled={loading}
              onClick={handleGoogleSignup}
            >
              {loading ? (
                <span className="loader"></span>
              ) : (
                <>
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="google-icon"
                  />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <span className="signup-switch-text">
              Already have an account? <Link to="/login">Sign In</Link>
            </span>

            <span className="signup-switch-text-back">
              <Link to="/">Back to home</Link>
            </span>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="otp-form">
            <h2>Verify Your Email</h2>
            <p>
              Enter OTP sent to <b>{formData.email}</b>
            </p>

            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
            />

            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? <span className="loader"></span> : "Verify OTP"}
            </button>

            <span className="signup-switch-text-back">
              <button
                type="button"
                className="back-step-btn"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                ⬅ Back
              </button>
            </span>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUp;

