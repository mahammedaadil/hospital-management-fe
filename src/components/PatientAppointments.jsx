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
  const [showPopup, setShowPopup] = useState(false); // Toggle Popup

  const [editedUser, setEditedUser] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    email: "",
    phone: "",
  });

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
    doc.text(capitalizeWords(title), 20, 50); // Capitalize title
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

  // Fetch patient appointments only when the button is clicked
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
  
    // Token Number in a bigger and bold style
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 255);
    doc.text(`Token Number: ${appointment.tokenNumber}`, 20, 80);
  
    // Reset styles for other data
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
    toast.success("Your Payment Receipt  Downloaded Successfully!");
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
        <div className="appointments-list">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <div className="appointment-item" key={appointment._id}>
              <p><strong>Patient Name:</strong> {appointment.firstName} {appointment.lastName}</p>
              <p><strong>Date:</strong> {new Date(appointment.appointment_date).toLocaleDateString()}</p>
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
                    <>
                      <p><strong>Razorpay Order ID:</strong> {appointment.payment.razorpayOrderId}</p>
                      
                    </>
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
          <p>No Appointments Found!</p>
        )}
      </div>
      )}
    </section>
  );
};

export default PatientAppointments;
