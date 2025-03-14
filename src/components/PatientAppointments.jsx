import React, { useContext, useEffect, useState } from "react";
import { AiFillCloseCircle } from "react-icons/ai";
import { GoCheckCircleFill } from "react-icons/go";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../axios";
import { Context } from "../main";

const PatientAppointments = () => {
  const { isAuthenticated, user, setUser, setIsAuthenticated } = useContext(Context);
  const [appointments, setAppointments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // Toggle Popup

  const [editedUser, setEditedUser] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    email: "",
    phone: "",
  });

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get("user/patient/me", { withCredentials: true });
        setIsAuthenticated(true);
        setUser(response.data.user);
        setEditedUser({
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          dob: response.data.user.dob ? response.data.user.dob.split("T")[0] : "",
          gender: response.data.user.gender || "",
          email: response.data.user.email || "",
          phone: response.data.user.phone || "",
        });
      } catch (error) {
        setIsAuthenticated(false);
        setUser({});
        toast.error("Error fetching user information");
      }
    };
    fetchUser();
  }, [setIsAuthenticated, setUser]);

  // Fetch patient appointments only when the button is clicked
  const fetchAppointments = async () => {
    if (!user?._id) return;
    try {
      const { data } = await axiosInstance.get(`appointment/getpatient/${user._id}`, {
        withCredentials: true,
      });
      setAppointments(data.appointments);
      setShowPopup(true); // Show popup
    } catch (error) {
      setAppointments([]);
      toast.error("Error fetching appointments");
    }
  };

  const handleEditClick = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setEditedUser({
      firstName: user.firstName,
      lastName: user.lastName,
      dob: user.dob ? user.dob.split("T")[0] : "",
      gender: user.gender || "",
      email: user.email || "",
      phone: user.phone || "",
    });
    setIsEditing(false);
  };

  const handleSaveChanges = async () => {
    if (!window.confirm("Are you sure you want to update your details?")) return;
    try {
      const response = await axiosInstance.put(
        "user/patient/update",
        {
          firstName: editedUser.firstName,
          lastName: editedUser.lastName,
          dob: editedUser.dob,
          gender: editedUser.gender,
          email: editedUser.email,
          phone: editedUser.phone,
        },
        { withCredentials: true }
      );
      setUser(response.data.user);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  if (!isAuthenticated) return <Navigate to={"/login"} />;

  return (
    <section className="patient-appointments page">
      {/* User Profile Section */}
      <h5>Your Profile</h5>
      {user && (
        <div className="user-info">
          {isEditing ? (
            <>
              <p>
                <strong>Name:</strong>
                <input
                  type="text"
                  value={editedUser.firstName}
                  onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                />
                <input
                  type="text"
                  value={editedUser.lastName}
                  onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
                />
              </p>
              <p>
                <strong>Date of Birth:</strong>
                <input
                  type="date"
                  value={editedUser.dob}
                  onChange={(e) => setEditedUser({ ...editedUser, dob: e.target.value })}
                />
              </p>
              <p>
                <strong>Gender:</strong>
                <select
                  value={editedUser.gender}
                  onChange={(e) => setEditedUser({ ...editedUser, gender: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </p>
              <p>
                <strong>Email:</strong>
                <input
                  type="email"
                  value={editedUser.email}
                  onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                />
              </p>
              <p>
                <strong>Phone:</strong>
                <input
                  type="tel"
                  value={editedUser.phone}
                  onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                />
              </p>
              <button className="btn save-btn" onClick={handleSaveChanges}>
                Save
              </button>
              <button className="btn cancel-btn" onClick={handleCancelEdit}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <p>
                <strong>Name:</strong> {user.firstName} {user.lastName}
              </p>
              <p>
                <strong>Date of Birth:</strong>{" "}
                {user.dob
                  ? new Date(user.dob).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
              <p>
                <strong>Gender:</strong> {user.gender || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {user.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {user.phone || "N/A"}
              </p>
              <button className="btn edit-btn" onClick={handleEditClick}>
                Edit
              </button>
            </>
          )}
        </div>
      )}

      {/* View Appointments Button */}
      <button className="btn view-appointments-btn" onClick={fetchAppointments}>
        View My Appointments
      </button>

      {/* Popup Modal */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <span className="close-btn" onClick={() => setShowPopup(false)}>✖</span>
            <h5>Your Appointments</h5>
            <div className="appointments-list">
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <div className="appointment-item" key={appointment._id}>
                    <p><strong>Date:</strong> {new Date(appointment.appointment_date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {appointment.timeSlot}</p>
                    <p><strong>Department:</strong> {appointment.department}</p>
                    <p><strong>Doctor:</strong> {`${appointment.doctor.firstName} ${appointment.doctor.lastName}`}</p>
                    <p><strong>Status:</strong> {appointment.status}</p>
                  </div>
                ))
              ) : (
                <p>No Appointments Found!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PatientAppointments;
