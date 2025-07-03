import React, { useState } from "react";
// Remove the unused import
// import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages

    try {
      const response = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Password reset instructions sent to your email.");
      } else {
        setMessage(data.message || "Failed to process request.");
      }
    } catch (error) {
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <img src="/image.png" alt="Nammaqa Logo" className="logo" />
        <h2 className="title">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <label>Email-ID</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter Email-ID"
            />
            <p className="input-hint">Enter your registered Email-ID</p>
          </div>

          {message && <p className="message">{message}</p>}

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;