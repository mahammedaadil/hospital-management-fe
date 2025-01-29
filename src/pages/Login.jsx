import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Link, useNavigate, Navigate } from "react-router-dom";
import axiosInstance from "../axios";
import ForgotPassword from "./ForgotPassword";

const Login = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigateTo = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance
        .post("user/login", { email, password, role: "Patient" }, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        })
        .then((res) => {
          toast.success(res.data.message);
          setIsAuthenticated(true);
          navigateTo("/appointment");
          setEmail("");
          setPassword("");
          localStorage.setItem("token", res.data.token);
        });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <>
      <div className="container form-component login-form">
        <h2>Login</h2>
        <p>Please Login To Continue</p>
        <p>
          You Must Have To Login To Take An Appointment 
          In Our Hospital With Online System.
        </p>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <div className="login-options">
            <p style={{ marginBottom: 0 }}>Not Registered?</p>
            <Link to={"/register"} style={{ textDecoration: "none", color: "#271776ca" }}>
              Register Now
            </Link>
          </div>
          <div className="button-container">
            <button type="submit">Login</button>
            <button
              type="button"
              className="forgot-password-btn"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </button>
          </div>
        </form>
      </div>

      {showForgotPassword && (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      )}
    </>
  );
};

export default Login;
