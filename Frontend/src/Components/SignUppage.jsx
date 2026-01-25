import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./SignUpPage.css";
import eyeopen from "../assets/eye_open.png";
import eyeclose from "../assets/eye-close.svg";
import SignupImg from "../assets/Signupimg.png";

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

  const handlePasswordChange = (e) => {
    const value = e.target.value;

    setFormData({ ...formData, password: value });

    setPasswordValid({
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[!@#$%^&*]/.test(value),
      match: value === formData.confirmPassword,
    });
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;

    setFormData({ ...formData, confirmPassword: value });

    setPasswordValid((prev) => ({
      ...prev,
      match: value === formData.password,
    }));
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    const allValid =
      passwordValid.length &&
      passwordValid.upper &&
      passwordValid.lower &&
      passwordValid.number &&
      passwordValid.special &&
      passwordValid.match;

    if (!allValid) {
      alert("Please follow password rules and confirm password correctly.");
      return;
    }

    setLoading(true);

    // ✅ Later: call Django API here
    // Example:
    // await axios.post("http://localhost:8000/api/signup/", formData);

    setTimeout(() => {
      setLoading(false);
      setStep(2); // move to OTP step
    }, 1000);
  };

  // ✅ OTP Submit
  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (otp.length < 4) {
      alert("Please enter valid OTP");
      return;
    }

    setLoading(true);

    // ✅ Later: call OTP verify API here
    // Example:
    // await axios.post("http://localhost:8000/api/verify-otp/", { email: formData.email, otp });

    setTimeout(() => {
      setLoading(false);
      alert("OTP Verified Successfully ✅");
      navigate("/login");
    }, 1000);
  };

  return (
    <div className="signup-page">
      <div className="signup-left">
        <img
          src={SignupImg}
          alt="Signup Illustration"
          className="signup-illustration"
        />
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
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
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
                src={
                  passwordVisible
                    ? eyeopen
                    : eyeclose
                }
                alt="toggle password"
                className="toggle-password-img"
                onClick={() => setPasswordVisible(!passwordVisible)}
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

            <div className="password-rules">
              <p style={{ color: passwordValid.match ? "green" : "red" }}>
                • Passwords match
              </p>
            </div>

            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? <span className="loader"></span> : "Sign Up"}
            </button>
          <button type="button" className="googlesignup-btn" disabled={loading}>
    {loading ? (
        <span className="loader"></span>
    ) : (
        <>
            <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google Logo" 
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
            <p>Enter OTP sent to <b>{formData.email}</b></p>

            <input
              type="text"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
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
