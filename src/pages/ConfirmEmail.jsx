import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from '../axios';

const ConfirmEmail = () => {
  const { token } = useParams(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid confirmation link!");
      navigate("/");
      return;
    }

    const confirmEmail = async () => {
      try {
        // Use the Axios instance for the API call
        const res = await axiosInstance.get(`/user/confirm-email/${token}`);
        toast.success(res.data.message);
        navigate("/login"); // Redirect to login page after confirmation
      } catch (error) {
        toast.error(error.response?.data?.message || "Email confirmation failed!");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, [token, navigate]);

  return (
    <div className="confirm-email-container">
      <h2>{loading ? "Verifying Email..." : "Email Verification"}</h2>
      {loading && (
        <>
          <div className="loading-spinner"></div>
          <p>Please wait while we confirm your email...</p>
        </>
      )}
      {!loading && (
        <button className="btn" onClick={() => navigate("/login")}>
          Go to Login
        </button>
      )}
    </div>
  );
};

export default ConfirmEmail;