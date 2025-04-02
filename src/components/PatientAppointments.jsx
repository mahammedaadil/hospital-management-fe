import React, { useContext, useEffect, useState } from "react";
import { AiFillCloseCircle } from "react-icons/ai";
import { GoCheckCircleFill } from "react-icons/go";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../axios";
import { Context } from "../main";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PatientAppointments = () => {
  const { isAuthenticated, user, setUser, setIsAuthenticated } = useContext(Context);
  const [appointments, setAppointments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [viewType, setViewType] = useState("upcoming");


  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    
    // Add ordinal suffix to day
    const getOrdinalSuffix = (day) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  };
  
  const [editedUser, setEditedUser] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    email: "",
    phone: "",
  });

  // Categorize appointments into past and upcoming
  const categorizeAppointments = (appointments) => {
    const now = new Date();
    return appointments.reduce((acc, appointment) => {
      const appointmentDate = new Date(appointment.appointment_date);
      if (appointmentDate < now) {
        acc.past.push(appointment);
      } else {
        acc.upcoming.push(appointment);
      }
      return acc;
    }, { past: [], upcoming: [] });
  };

  const { past, upcoming } = categorizeAppointments(appointments);

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  
  const addReportHeader = (doc, title) => {
    const img = new Image();
    img.src = "public/logo.png";
    doc.addImage(img, "PNG", 10, 10, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("AadiCare - Your Health, Our Priority", 50, 20);
    doc.setFontSize(12);
    doc.text("Contact: +91-9106624120 | Email: adilchoice30@gmail.com", 50, 30);
    doc.text(capitalizeWords(title), 20, 50);
    doc.text(`Report Generated On: ${new Date().toLocaleString()}`, 20, 60);
  };

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

  // Fetch patient appointments
  const fetchAppointments = async () => {
    if (!user?._id) return;
    try {
      const { data } = await axiosInstance.get(`appointment/getpatient/${user._id}`, {
        withCredentials: true,
      });
  
      const appointmentsWithPayments = await Promise.all(
        data.appointments.map(async (appointment) => {
          try {
            const paymentResponse = await axiosInstance.get(`payment/getbyappointment/${appointment._id}`, {
              withCredentials: true,
            });
            return { ...appointment, payment: paymentResponse.data.payment };
          } catch (error) {
            return { ...appointment, payment: null };
          }
        })
      );
  
      setAppointments(appointmentsWithPayments);
      setShowPopup(true);
    } catch (error) {
      setAppointments([]);
      toast.error("Error fetching appointments and payments");
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

  const generatePDF = (appointment) => {
    const doc = new jsPDF();
    addReportHeader(doc, "Appointment Details");
  
    const tableColumn = ["Field", "Details"];
    const tableRows = [
      ["Patient Name", `${appointment.firstName} ${appointment.lastName}`],
      ["Date", new Date(appointment.appointment_date).toLocaleDateString()],
      ["Time", appointment.timeSlot],
      ["Department", appointment.department],
      ["Doctor", `${appointment.doctor.firstName} ${appointment.doctor.lastName}`],
      ["Status", appointment.status],
    ];
  
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 255);
    doc.text(`Token Number: ${appointment.tokenNumber}`, 20, 80);
  
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
  
    if (appointment.payment) {
      tableRows.push(
        ["Payment Amount", `${appointment.payment.amount} Rupees`],
        ["Payment Mode", appointment.payment.paymentMode],
        ["Payment Status", appointment.payment.status],
        appointment.payment.paymentMode === "Online" ? ["Razorpay Order ID", appointment.payment.razorpayOrderId] : null
      );
    }
  
    autoTable(doc, { startY: 90, head: [tableColumn], body: tableRows.filter(Boolean) });
    doc.save(`Appointment_${appointment._id}.pdf`);
    toast.success("Your Payment Receipt Downloaded Successfully!");
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
                 <strong>Date of Birth:</strong> {formatDate(user.dob)}
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
        <div className="appointments-popup">
          <div className="appointments-header">
            <h3>My Appointments</h3>
            <div className="view-toggle">
              <button
                className={`btn ${viewType === 'upcoming' ? 'active' : ''}`}
                onClick={() => setViewType('upcoming')}
              >
                Upcoming
              </button>
              <button
                className={`btn ${viewType === 'past' ? 'active' : ''}`}
                onClick={() => setViewType('past')}
              >
                Past
              </button>
            </div>
            <button className="close-btn" onClick={() => setShowPopup(false)}>
              <AiFillCloseCircle />
            </button>
          </div>

          <div className="appointments-list">
            {(viewType === 'upcoming' ? upcoming : past).length > 0 ? (
              (viewType === 'upcoming' ? upcoming : past).map((appointment) => (
                <div className="appointment-item" key={appointment._id}>
                  <p><strong>Patient Name:</strong> {appointment.firstName} {appointment.lastName}</p>
                  <p><strong>Date:</strong> {formatDate(appointment.appointment_date)}</p>
                  <p><strong>Time:</strong> {appointment.timeSlot}</p>
                  <p><strong>Department:</strong> {appointment.department}</p>
                  <p><strong>Doctor:</strong> {`${appointment.doctor.firstName} ${appointment.doctor.lastName}`}</p>
                  <p><strong>Status:</strong> {appointment.status}</p>
                  <p><strong>Token Number:</strong> {appointment.tokenNumber}</p>
          
                  {appointment.payment ? (
                    <>
                      <p><strong>Payment Amount:</strong> ₹{appointment.payment.amount}</p>
                      <p><strong>Payment Mode:</strong> {appointment.payment.paymentMode}</p>
                      <p><strong>Payment Status:</strong> {appointment.payment.status}</p>
                      {appointment.payment.paymentMode === "Online" && (
                        <p><strong>Razorpay Order ID:</strong> {appointment.payment.razorpayOrderId}</p>
                      )}
                    </>
                  ) : (
                    <p><strong>Payment:</strong> No Payment Details Found</p>
                  )}
                  <button className="pdf-btn" onClick={() => generatePDF(appointment)}>
                    Download Receipt
                  </button>
                </div>
              ))
            ) : (
              <p>No {viewType === 'upcoming' ? 'Upcoming' : 'Past'} Appointments Found!</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default PatientAppointments;