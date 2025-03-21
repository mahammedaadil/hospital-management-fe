import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../axios";

const AppointmentForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [department, setDepartment] = useState("Pediatrics");
  const [doctorFirstName, setDoctorFirstName] = useState("");
  const [doctorLastName, setDoctorLastName] = useState("");
  const [doctorFees, setDoctorFees] = useState("");
  const [address, setAddress] = useState("");
  const [hasVisited, setHasVisited] = useState(false);
  const [timeSlot, setTimeSlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [doctorAvailability, setDoctorAvailability] = useState([]);

  const departmentsArray = [
    "Pediatrics",
    "Orthopedics",
    "Cardiology",
    "Neurology",
    "Oncology",
    "Radiology",
    "Physical Therapy",
    "Dermatology",
    "ENT",
  ];

  const timeSlots = [
    "09:00-09:30",
    "09:30-10:00",
    "10:00-10:30",
    "10:30-11:00",
    "11:00-11:30",
    "11:30-12:00",
    "12:00-12:30",
    "12:30-01:00",
    "14:00-14:30",
    "14:30-15:00",
    "15:00-15:30",
    "15:30-16:00",
    "16:00-16:30",
    "16:30-17:00",
    "17:00-17:30",
    "17:30-18:00",
    "18:00-18:30",
    "18:30-19:00",
    "19:00-19:30",
    "19:30-20:00",
  ];

  const navigateTo = useNavigate();
  const location = useLocation();
  const { doctor } = location.state || {};

  useEffect(() => {
    if (doctor) {
      setDoctorFirstName(doctor.firstName);
      setDoctorLastName(doctor.lastName);
      setDepartment(doctor.doctorDepartment);
      setDoctorFees(doctor.doctorFees || "");
      setDoctorAvailability(doctor.doctorAvailability || []);
    }
  }, [doctor]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axiosInstance.get("user/doctors", {
          withCredentials: true,
        });
        setDoctors(data.doctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to load doctors.");
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleDoctorChange = (e) => {
    const [firstName, lastName] = e.target.value.split(" ");
    setDoctorFirstName(firstName);
    setDoctorLastName(lastName);

    const selectedDoctor = doctors.find(
      (doctor) => doctor.firstName === firstName && doctor.lastName === lastName
    );

    if (selectedDoctor) {
      setDoctorFees(selectedDoctor.doctorFees || "");
      setDoctorAvailability(selectedDoctor.doctorAvailability || []);
      setTimeSlot("");
    }
  };

  const convertToISO = (dateString) => {
    if (!dateString || dateString.length < 10) return ""; // Return empty if not in DD/MM/YYYY format
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`; // Convert to YYYY-MM-DD
  };

  const handleDateChange = (e, setDateFunction) => {
    let input = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (input.length > 8) input = input.slice(0, 8); // Restrict to 8 digits (DDMMYYYY)

    // Format as DD/MM/YYYY
    let formatted = input;
    if (input.length > 2) formatted = `${input.slice(0, 2)}/${input.slice(2)}`;
    if (input.length > 4) formatted = `${input.slice(0, 2)}/${input.slice(2, 4)}/${input.slice(4)}`;

    setDateFunction(formatted);
  };

  const handleAppointment = async (e) => {
    e.preventDefault();

    const isoDob = convertToISO(dob); // Convert DD/MM/YYYY to YYYY-MM-DD
    const isoAppointmentDate = convertToISO(appointmentDate); // Convert DD/MM/YYYY to YYYY-MM-DD

    if (!isoDob || !isoAppointmentDate) {
      toast.error("Please enter valid dates for DOB and Appointment Date.");
      return;
    }

    if (paymentMethod === "Online") {
      try {
        const orderResponse = await axiosInstance.post("payment/create-order", {
          amount: doctorFees * 100,
          currency: "INR",
        });

        const { id: order_id } = orderResponse.data;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: doctorFees * 100,
          currency: "INR",
          name: "AadiCare Hospital",
          description: "Appointment Booking",
          order_id,
          handler: async function (response) {
            try {
              const hasVisitedBool = Boolean(hasVisited);
              const { data } = await axiosInstance.post(
                "appointment/post",
                {
                  firstName,
                  lastName,
                  email,
                  phone,
                  dob: isoDob,
                  gender,
                  appointment_date: isoAppointmentDate,
                  timeSlot,
                  department,
                  doctor_firstName: doctorFirstName,
                  doctor_lastName: doctorLastName,
                  doctor_fees: doctorFees,
                  paymentMethod,
                  hasVisited: hasVisitedBool,
                  address,
                  paymentId: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                },
                {
                  withCredentials: true,
                  headers: { "Content-Type": "application/json" },
                }
              );

              toast.success(
                `Appointment booked! Your token number is ${data.appointment.tokenNumber}`
              );
              navigateTo("/");
            } catch (error) {
              toast.error(error.response.data.message);
            }
          },
          prefill: {
            name: `${firstName} ${lastName}`,
            email: email,
            contact: phone,
          },
          theme: {
            color: "#3399cc",
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (error) {
        toast.error("Failed to initiate payment.");
      }
    } else {
      try {
        const hasVisitedBool = Boolean(hasVisited);
        const { data } = await axiosInstance.post(
          "appointment/post",
          {
            firstName,
            lastName,
            email,
            phone,
            dob: isoDob,
            gender,
            appointment_date: isoAppointmentDate,
            timeSlot,
            department,
            doctor_firstName: doctorFirstName,
            doctor_lastName: doctorLastName,
            doctor_fees: doctorFees,
            paymentMethod,
            hasVisited: hasVisitedBool,
            address,
          },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );

        toast.success(
          `Appointment booked! Your token number is ${data.appointment.tokenNumber}`
        );
        navigateTo("/");
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  const getAvailableTimeSlots = () => {
    if (!appointmentDate || doctorAvailability.length === 0) return [];

    const selectedDay = new Date(convertToISO(appointmentDate)).toLocaleString("en-us", {
      weekday: "long",
    });

    const availability = doctorAvailability.find(
      (avail) => avail.day === selectedDay
    );

    if (availability) {
      return timeSlots.filter((slot) => availability.timings.includes(slot));
    }
    return [];
  };

  return (
    <div className="container form-component appointment-form">
      <h2>Appointment</h2>
      <form onSubmit={handleAppointment}>
        <div>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="number"
            placeholder="Mobile Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Date of Birth (DD/MM/YYYY)"
            value={dob}
            onChange={(e) => handleDateChange(e, setDob)}
            maxLength="10"
          />
        </div>
        <div>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input
            type="text"
            placeholder="Appointment Date (DD/MM/YYYY)"
            value={appointmentDate}
            onChange={(e) => handleDateChange(e, setAppointmentDate)}
            maxLength="10"
          />
        </div>
        <div>
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setDoctorFirstName("");
              setDoctorLastName("");
              setDoctorAvailability([]);
            }}
          >
            {departmentsArray.map((depart, index) => (
              <option value={depart} key={index}>
                {depart}
              </option>
            ))}
          </select>

          <select
            value={`${doctorFirstName} ${doctorLastName}`}
            onChange={handleDoctorChange}
            disabled={!department}
          >
            <option value="">Select Doctor</option>
            {doctors
              .filter((doctor) => doctor.doctorDepartment === department)
              .map((doctor, index) => (
                <option
                  value={`${doctor.firstName} ${doctor.lastName}`}
                  key={index}
                >
                  {doctor.firstName} {doctor.lastName}
                </option>
              ))}
          </select>
        </div>

        <div>
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            disabled={!appointmentDate || !doctorFirstName || !doctorLastName}
          >
            <option value="">Select Time Slot</option>
            {getAvailableTimeSlots().map((slot, index) => (
              <option value={slot} key={index}>
                {slot}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="text"
            placeholder="Doctor's Fee"
            value={doctorFees}
            disabled
          />
        </div>

        <textarea
          rows="10"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <p style={{ marginBottom: 0 }}>Have you visited before?</p>
            <input
              type="checkbox"
              checked={hasVisited}
              onChange={(e) => setHasVisited(e.target.checked)}
              style={{ transform: "scale(1.17)", cursor: "pointer" }}
            />
          </label>
        </div>

        <div>
          <p>Payment Method:</p>
          <label>
            <input
              type="radio"
              value="Online"
              checked={paymentMethod === "Online"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />{" "}
            Pay Online
          </label>
          <label>
            <input
              type="radio"
              value="Offline"
              checked={paymentMethod === "Offline"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />{" "}
            Pay Offline
          </label>
        </div>

        <button type="submit">GET APPOINTMENT</button>
      </form>
    </div>
  );
};

export default AppointmentForm;