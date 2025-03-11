import React, { useEffect, useState } from "react";
import Hero from "../components/Hero";
import AppointmentForm from "../components/AppointmentForm";


const Appointment = () => {
  return (
    <>
      <Hero
        title={"Schedule Your Appointment | AadiCare Medical Institute"}
        imageUrl={"/signin.png"}
      />
      <AppointmentForm/>
    </>
  );
};

export default Appointment;