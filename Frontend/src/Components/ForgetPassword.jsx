import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgetPassword.css";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const otpRefs = useRef([]);

  // Password validation logic
  const passwordValid = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };
  const isPasswordMatch = password && password === confirmPassword;

  // Handle OTP input
  const handleOtpChange = (value, i) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[i] = value;
      setOtp(newOtp);
      if (value && i < 5) otpRefs.current[i + 1].focus();
    }
  };

  // Send OTP
  const sendOtp = async () => {
    setSending(true);
    try {
      const res = await fetch("http://localhost:3021/signin/forgotpassword/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) alert(data.message);
      else {
        setStep(2);
        setResendTimer(30);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setSending(false);
    }
  };

  // Resend OTP timer
  useEffect(() => {
    if (step === 2 && resendTimer > 0) {
      const interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer, step]);

  // Verify OTP
  const verifyOtp = async () => {
    try {
      const res = await fetch("http://localhost:3021/signin/forgotpassword/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join("") }),
      });
      const data = await res.json();
      if (res.ok) setStep(3);
      else alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  useEffect(() => {
    if (step === 2 && otp.join("").length === 6) {
      verifyOtp();
    }
  }, [otp]);

  // Reset password
  const resetPassword = async () => {
    try {
      const res = await fetch("http://localhost:3021/signin/forgotpassword/reset", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join(""), password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        navigate("/signin");
      } else alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="forgetpassword-wrapper">
      {/* STEP 1: EMAIL INPUT */}
      {step === 1 && (
        <div className="forgetpassword-card">
          <h2>Forgot <span className="guide-text">Password</span></h2>
          <p>Initialize security recovery. Enter your registered email.</p>
          <input
            type="email"
            placeholder="Enter your email"
            className="forgetpassword-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="forgetpassword-btn" onClick={sendOtp} disabled={sending}>
            {sending ? <span className="forgetpassword-loader" /> : "Transmit OTP"}
          </button>
          <span className="forgetpassword-back" onClick={() => navigate(-1)}>
            ⬅ Return to Login
          </span>
        </div>
      )}

      {/* STEP 2: OTP VERIFICATION */}
      {step === 2 && (
        <div className="forgetpassword-card">
          <h2>Verify <span className="guide-text">Identity</span></h2>
          <p>Enter the 6-digit code sent to your terminal.</p>
          <div className="forgetpassword-otp-wrapper">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => (otpRefs.current[i] = el)}
                value={d}
                onChange={(e) => handleOtpChange(e.target.value, i)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1].focus();
                }}
                maxLength={1}
                className="forgetpassword-otpbox"
              />
            ))}
          </div>
          <p className="auto-verify-msg">Auto-verifying on completion...</p>
          {resendTimer > 0 ? (
            <button className="forgetpassword-resend1" disabled>
              Re-request available in {resendTimer}s
            </button>
          ) : (
            <button className="forgetpassword-resend2" onClick={sendOtp}>
              Resend OTP
            </button>
          )}
        </div>
      )}

      {/* STEP 3: RESET PASSWORD */}
      {step === 3 && (
        <div className="forgetpassword-card">
          <h2>Secure <span className="guide-text">Reset</span></h2>
          <p>Update your credentials with a high-entropy password.</p>
          
          <div className="forgetpassword-input-wrapper">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="New Password"
              className="forgetpassword-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="forgetpassword-toggle-btn"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? "Hide" : "Show"}
            </button>
          </div>

          <div className="forgetpassword-validation">
            <p style={{ color: passwordValid.length ? "var(--cyber-cyan, #38bdf8)" : "#ff4d4d" }}>
              {passwordValid.length ? "✔" : "✖"} Minimum 8 characters
            </p>
            <p style={{ color: passwordValid.upper ? "#38bdf8" : "#ff4d4d" }}>
              {passwordValid.upper ? "✔" : "✖"} Uppercase letter
            </p>
            <p style={{ color: passwordValid.lower ? "#38bdf8" : "#ff4d4d" }}>
              {passwordValid.lower ? "✔" : "✖"} Lowercase letter
            </p>
            <p style={{ color: passwordValid.number ? "#38bdf8" : "#ff4d4d" }}>
              {passwordValid.number ? "✔" : "✖"} Number
            </p>
            <p style={{ color: passwordValid.special ? "#38bdf8" : "#ff4d4d" }}>
              {passwordValid.special ? "✔" : "✖"} Special character
            </p>
          </div>

          <input
            type="password"
            placeholder="Confirm New Password"
            className="forgetpassword-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {!isPasswordMatch && confirmPassword && (
            <p className="forgetpassword-validation-message" style={{ color: "#ff4d4d", fontSize: "0.8rem", marginBottom: "10px" }}>
              Passwords do not match
            </p>
          )}

          <button
            className="forgetpassword-btn"
            disabled={!Object.values(passwordValid).every(Boolean) || !isPasswordMatch}
            onClick={resetPassword}
          >
            Update Credentials
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgetPassword;