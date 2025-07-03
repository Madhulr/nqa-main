import React, { useState } from "react";
  import { useNavigate } from "react-router-dom";
  import "./LoginPage.css";

  const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleForgotPassword = () => {
      navigate("/forgot-password"); // Navigate to ForgotPassword page
    };

    const handleSubmit = () => {
      setError(""); // Clear previous errors

      // Validation for empty fields
      if (!email || !password) {
        setError("Both fields are required");
        return;
      }

      if (email === "nammaqa@gmail.com" && password === "nammaqa123") {
        console.log("Login Successful");
        navigate("/sidebar"); // Navigate to Sidebar Page
      } else {
        setError("Invalid Email or Password");
      }
    };

    return (
      <div className="login-page">
        <div className="login-box">
          <img src="/image.png" alt="Nammaqa Logo" className="logo" />
          <h2>Councilors Log-In</h2>

          {error && <p className="error-message">{error}</p>}

          <div className="input-container">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>Email-ID</label>
          </div>

          <div className="input-container">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label>Password</label>
          </div>

          <button onClick={handleForgotPassword} className="forgot-password">Forgot Password?</button>

          <button onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    );
  };
  //to see

  export default LoginPage;