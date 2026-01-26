import React from "react";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./Components/LandingPage";
import SignUp from "./Components/SignUppage";
import SignIn from "./Components/SignInPage";
import AboutPage from "./Components/AboutPage";
import FeedbackPage from "./Components/FeedbackPage";
import ContactPage from "./Components/ContactPage";
import ForgetPassword from "./Components/ForgetPassword";
import Dashboard from "./Components/Dashboard";
import ProtectedRoute from "./ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<SignIn />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/forget-password" element={<ForgetPassword />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
