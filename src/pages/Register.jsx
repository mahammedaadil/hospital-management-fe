import axiosInstance from "../axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState(""); // Stores DD/MM/YYYY format for UI
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  // Convert DD/MM/YYYY to YYYY-MM-DD for backend
  const convertToISO = (dateString) => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`; // Convert to YYYY-MM-DD
  };

  const handleDobChange = (e) => {
    let input = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (input.length > 8) input = input.slice(0, 8); // Restrict to 8 digits (DDMMYYYY)

    // Format as DD/MM/YYYY
    let formatted = input;
    if (input.length > 2) formatted = `${input.slice(0, 2)}/${input.slice(2)}`;
    if (input.length > 4) formatted = `${input.slice(0, 2)}/${input.slice(2, 4)}/${input.slice(4)}`;

    setDob(formatted);
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    try {
      const isoDob = convertToISO(dob); // Convert DD/MM/YYYY to YYYY-MM-DD

      const res = await axiosInstance.post("/user/patient/register", {
        firstName,
        lastName,
        email,
        phone,
        dob: isoDob, // Send in YYYY-MM-DD format
        gender,
        password,
        confirmPassword,
        role: "Patient",
      });

      toast.success(res.data.message);
      toast.info("Please check your email to verify your account.");
      navigate("/");

      // Reset fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setDob("");
      setGender("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed!");
    }
  };

  return (
    <div className="container form-component register-form">
      <h2>Sign Up</h2>
      <p>Please Sign Up To Continue</p>
      <p>Let's Get Started!</p>
      <form onSubmit={handleRegistration}>
        <div>
          <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div>
          <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="number" placeholder="Mobile Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <input
            type="text"
            placeholder="Date of Birth (DD/MM/YYYY)"
            value={dob}
            onChange={handleDobChange}
            maxLength="10"
          />
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="password" placeholder="Confirm Your Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <div style={{ gap: "10px", justifyContent: "flex-end", flexDirection: "row" }}>
          <p style={{ marginBottom: 0 }}>Already Registered?</p>
          <Link to={"/login"} style={{ textDecoration: "none", color: "#271776ca" }}>
            Login Now
          </Link>
        </div>
        <div style={{ justifyContent: "center", alignItems: "center" }}>
          <button type="submit">Register</button>
        </div>
      </form>
    </div>
  );
};

export default Register;
