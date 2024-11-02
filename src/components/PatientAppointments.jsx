import React, { useContext, useEffect, useState } from "react";
import { AiFillCloseCircle } from "react-icons/ai";
import { GoCheckCircleFill } from "react-icons/go";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../axios";
import { Context } from "../main";

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const { isAuthenticated, user } = useContext(Context); // Assuming "user" holds patient info

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axiosInstance.get(
          `appointment/getpatient/${user._id}`,
          { withCredentials: true }
        );
        setAppointments(data.appointments);
      } catch (error) {
        setAppointments([]);
        toast.error("Error fetching appointments");
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user]);

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <section className="patient-appointments page">
      <h5>Your Appointments</h5>

      <div className="appointments-list">
        {appointments && appointments.length > 0 ? (
          appointments.map((appointment) => (
            <div className="appointment-item" key={appointment._id}>
              <div className="appointment-info">
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(appointment.appointment_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong> {appointment.timeSlot}
                </p>
                <p>
                  <strong>Department:</strong> {appointment.department}
                </p>
                <p>
                  <strong>Doctor:</strong> {`${appointment.doctor.firstName} ${appointment.doctor.lastName}`}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      appointment.status === "Pending"
                        ? "value-pending"
                        : appointment.status === "Accepted"
                        ? "value-accepted"
                        : "value-rejected"
                    }
                  >
                    {appointment.status}
                  </span>
                </p>
                <p>
                  <strong>Visited:</strong>{" "}
                  {appointment.hasVisited ? (
                    <GoCheckCircleFill className="green" />
                  ) : (
                    <AiFillCloseCircle className="red" />
                  )}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No Appointments Found!</p>
        )}
      </div>
    </section>
  );
};

export default PatientAppointments;
