import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import eyeopen from "../assets/eye_open.png";
import eyeclose from "../assets/eye-close.svg";
import "./ForgetPassword.css";
const API_URL = "http://localhost:8000/api";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const otpRefs = useRef([]);
  const isVerifyingRef = useRef(false); 

  const passwordValid = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };

  const isPasswordMatch = password.length > 0 && password === confirmPassword;

  const handleSendOtp = async (isResend = false) => {
    if (!email.trim()) return alert("Email is required");
    if (isResend) setResendLoading(true);
    else setSending(true);

    try {
      const res = await fetch(`${API_URL}/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(isResend ? "A new recovery code has been sent!" : "OTP sent successfully!");
        setOtp(new Array(6).fill(""));
        setStep(2);
        setResendTimer(30);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        alert(data.message || "Email not found.");
      }
    } catch (err) {
      console.log(err);
      alert("Server connection failed.");
    } finally {
      setSending(false);
      setResendLoading(false);
    }
  };

  const handleOtpChange = (value, i) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[i] = value;
      setOtp(newOtp);

      if (value && i < 5) otpRefs.current[i + 1]?.focus();
    }
  };

  useEffect(() => {
    const verifyOtp = async () => {
      if (isVerifyingRef.current) return;
      isVerifyingRef.current = true;

      setVerifying(true);

      try {
        const res = await fetch(`${API_URL}/verify-otp/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), otp: otp.join("") }),
        });

        const data = await res.json();

        if (res.ok) {
          setStep(3);
        } else {
          alert(data.message || "Invalid OTP.");
          if ((data.message || "").toLowerCase().includes("expired")) {
            setStep(1);
          }

          setOtp(new Array(6).fill(""));
          setTimeout(() => otpRefs.current[0]?.focus(), 100);
        }
      } catch (err) {
        console.log(err);
        alert("Verification failed.");
      } finally {
        setVerifying(false);
        isVerifyingRef.current = false;
      }
    };

    if (step === 2 && otp.join("").length === 6) {
      verifyOtp();
    }
  }, [otp, step, email]);

  useEffect(() => {
    if (step === 2 && resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [resendTimer, step]);

  const resetPassword = async () => {
    if (!isPasswordMatch) return alert("Passwords do not match!");

    try {
      const res = await fetch(`${API_URL}/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.join(""),
          new_password: password,
        }),
      });
      const data = await res.json(); 
      if (res.ok) {
        alert("Credentials updated successfully.");
        navigate("/login");
      } else {
        alert(data.message || "Failed to reset.");
      }
    } catch (err) {
      console.log(err);
      alert("Network error.");
    }
  };

  return (
    <div className="forgetpassword-wrapper">
      <div className="forgetpassword-container">
        {step === 1 && (
          <div className="forgetpassword-card animate-slide">
            <h2>
              Forgot <span className="guide-text">Password</span>
            </h2>
            <p className="card-desc">Enter your email to receive a recovery code.</p>

            <input
              type="email"
              placeholder="operator@cyberguide.com"
              className="forgetpassword-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              className="forgetpassword-btn"
              onClick={() => handleSendOtp(false)}
              disabled={sending}
            >
              {sending ? <span className="forgetpassword-loader" /> : "Transmit OTP"}
            </button>

            <span className="forgetpassword-back" onClick={() => navigate(-1)}>
              ⬅ Return to Login
            </span>
          </div>
        )}

        {step === 2 && (
          <div className="forgetpassword-card animate-slide">
            <h2>
              Verify <span className="guide-text">Identity</span>
            </h2>
            <p className="card-desc">Enter the 6-digit decryption code.</p>

            <div className="forgetpassword-otp-wrapper">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  value={d}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[i] && i > 0) {
                      otpRefs.current[i - 1]?.focus();
                    }
                  }}
                  maxLength={1}
                  className="forgetpassword-otpbox"
                />
              ))}
            </div>

            {verifying && <p className="verifying-text">Checking code...</p>}

            <div className="resend-section">
              {resendTimer > 0 ? (
                <p className="resend-timer">Wait {resendTimer}s to resend</p>
              ) : (
                <button
                  className="forgetpassword-resend"
                  onClick={() => handleSendOtp(true)}
                  disabled={resendLoading}
                >
                  {resendLoading ? (
                    <span className="forgetpassword-loader-small" />
                  ) : (
                    "Resend OTP"
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="forgetpassword-card animate-slide">
            <h2>
              Secure <span className="guide-text">Reset</span>
            </h2>

            <div className="password-input-group">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="New Password"
                className="forgetpassword-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-visibility-btn"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                <img src={passwordVisible ? eyeopen : eyeclose} alt="Toggle" />
              </button>
            </div>

            <div className="forgetpassword-validation">
              <p style={{ color: passwordValid.length ? "green" : "red" }}>• Minimum 8 characters</p>
              <p style={{ color: passwordValid.upper ? "green" : "red" }}>• Uppercase letter</p>
              <p style={{ color: passwordValid.lower ? "green" : "red" }}>• Lowercase letter</p>
              <p style={{ color: passwordValid.number ? "green" : "red" }}>• Number (0-9)</p>
              <p style={{ color: passwordValid.special ? "green" : "red" }}>• Special character (!@#$%^&*)</p>
            </div>

            <input
              type="password"
              placeholder="Confirm New Password"
              className="forgetpassword-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <p style={{ color: isPasswordMatch ? "green" : "red", fontSize: "0.85rem", marginBottom: "15px" }}>
              {isPasswordMatch ? "✔ Passwords match" : "✖ Passwords must match"}
            </p>

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
    </div>
  );
};

export default ForgetPassword;