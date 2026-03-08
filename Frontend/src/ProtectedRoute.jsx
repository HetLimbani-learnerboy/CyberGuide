import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {

    // 1️⃣ Check OTP login (localStorage)
    const email = localStorage.getItem("cyberguide_user_email");
    const name = localStorage.getItem("cyberguide_user_name");

    if (email && name) {
      setAuthenticated(true);
      setLoading(false);
      return;
    }

    // 2️⃣ Check Google OAuth session
    fetch("http://127.0.0.1:8000/auth/me/", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {

        // Save Google user in localStorage
        localStorage.setItem("cyberguide_user_email", data.email);
        localStorage.setItem("cyberguide_user_name", data.name);

        setAuthenticated(true);
      })
      .catch(() => {
        setAuthenticated(false);
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return authenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;