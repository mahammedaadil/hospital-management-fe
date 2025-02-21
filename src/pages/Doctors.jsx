import axiosInstance from "../axios"; 
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate } from "react-router-dom"; 

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const { isAuthenticated, userRole } = useContext(Context); // Assuming `userRole` is stored to check if the user is a patient or not
  const [showAvailabilityInfo, setShowAvailabilityInfo] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState("All");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axiosInstance.get("/user/doctors");
        setDoctors(data.doctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error(error.response?.data?.message || "Error fetching doctors");
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = filterDepartment === "All" 
    ? doctors 
    : doctors.filter(doc => doc.doctorDepartment === filterDepartment);

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  // Toggle function for showing or hiding availability info
  const toggleAvailability = (doctorId) => {
    setShowAvailabilityInfo((prev) => (prev === doctorId ? null : doctorId)); // If the doctor ID is already shown, hide it, else show it
  };

  return (
    <section className="page doctors">
      <h1>DOCTORS</h1>
      <div className="filter-section">
        <label htmlFor="departmentFilter">Filter by Department:</label>
        <select
          id="departmentFilter"
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
        >
          <option value="All">All Departments</option>
          {Array.from(new Set(doctors.map(doc => doc.doctorDepartment))).map((dept, idx) => (
            <option key={idx} value={dept}>{dept}</option>
          ))}
        </select>
      </div>
      <div className="banner">
        {filteredDoctors && filteredDoctors.length > 0 ? (
          filteredDoctors.map((element) => (
            <div className="doctor-card" key={element._id}>
              <img
                src={element.docAvatar?.url || "/default-avatar.png"}
                alt="doctor avatar"
              />
              <h4>{`${element.firstName} ${element.lastName}`.toUpperCase()}</h4>
              <div className="doctor-details">
                <p>Email: <span>{element.email}</span></p>
                <p>Phone: <span>{element.phone}</span></p>
                <p>DOB: <span>{element.dob ? element.dob.substring(0, 10) : "N/A"}</span></p>
                <p>Department: <span>{element.doctorDepartment}</span></p>
                <p>Gender: <span>{element.gender}</span></p>
                <p>Fees: <span>₹{element.doctorFees}</span></p>
                <p>Joining Date: <span>{element.joiningDate ? element.joiningDate.substring(0, 10) : "N/A"}</span></p>
                {element.resignationDate && (
                  <p>Resignation Date: <span>{element.resignationDate.substring(0, 10)}</span></p>
                )}
              </div>

              {/* Conditional rendering of actions */}
              {userRole !== "patient" ? (
                // No actions for admin here, but you could add them if necessary
                <div className="actions">
                  <button 
                    className="btn btn-check-availability" 
                    onClick={() => toggleAvailability(element._id)} // Toggle availability info
                  >
                    {showAvailabilityInfo === element._id ? "Hide Availability" : "Check Availability"}
                  </button>
                </div>
              ) : (
                // Patient view - Show more information (if needed)
                <button 
                  className="btn btn-more-info" 
                  onClick={() => toggleAvailability(element._id)} // Toggle availability info
                >
                  {showAvailabilityInfo === element._id ? "Hide Availability" : "Check Availability"}
                </button>
              )}

              {/* Show Availability Info */}
              {showAvailabilityInfo === element._id && element.doctorAvailability && (
                <div className="availability-info">
                  <p><strong>Availability:</strong></p>
                  {element.doctorAvailability.length > 0 ? (
                    <ul>
                      {element.doctorAvailability.map((slot, index) => (
                        <li key={index}>
                          {slot.day}: {slot.timings}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No Availability Info</p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <h1>No Registered Doctors Found!</h1>
        )}
      </div>
    </section>
  );
};

export default Doctors;
