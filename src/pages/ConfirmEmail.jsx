import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ConfirmEmail = () => {
  const { token } = useParams(); // Get token from URL
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
        const res = await axios.get(`http://localhost:4000/api/v1/user/confirm-email/${token}`);
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
    <div className="container">
      <h2>{loading ? "Verifying Email..." : "Email Verification"}</h2>
      {loading && <p>Please wait while we confirm your email...</p>}
    </div>
  );
};

export default ConfirmEmail;
